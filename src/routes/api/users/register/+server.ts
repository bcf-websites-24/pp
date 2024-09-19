import { error, json, type RequestEvent } from "@sveltejs/kit";
import argon2 from "argon2";
import {
  is_object_empty,
  make_otp_cookie,
  other_error_logger,
} from "$lib/helpers.server";
import jwt from "jsonwebtoken";
import validator from "validator";
import { JWT_SECRET } from "$env/static/private";
import { run_query } from "$lib/db/index.server";

/**
 *
 * @param request_event
 * @returns  0  successful registration
 *          -2  student id is not numeric
 *          -3  student id has roll out of range [1,183]
 *          -4  username has space/non alphanumeric character, not allowing it
 * UNUSED   -5  non cse dept
 *          -6  invalid email address
 *          -7  username or student id already exists
 */
export async function POST(request_event: RequestEvent): Promise<Response> {
  const request: Request = request_event.request;
  const request_json: any = await request.json();
  const username: string = request_json.username;
  const student_id: string = request_json.student_id;
  const email: string = request_json.email;
  const password: string = request_json.password;
  const password_hash: string = await argon2.hash(password);

  let inputs: Array<string> = [username, student_id, email, password];

  inputs.forEach((element) => {
    if (element === undefined || element === null) {
      return error(422);
    }
  });

  // allowing only [a-zA-Z0-9_] in username
  if (!/^\w{4,32}$/.test(username)) {
    // Error code -4 means username has spaces/empty
    return json({
      registered: -4,
    });
  }

  if (!validator.isEmail(email)) {
    // Error code -6 means invalid email address
    return json({
      registered: -6,
    });
  }

  if (!/^\d{7}$/.test(student_id)) {
    // Error code -2 means roll is not numeric
    return json({
      registered: -2,
    });
  }

  const year = parseInt(student_id.substring(0, 2));
  let batch: number;

  if (year > 2023) {
    batch = 1900 + year;
  }
  else {
    batch = 2000 + year;
  }

  let roll: number = parseInt(student_id.substring(4));
  let user_type: string = "";

  if (isNaN(batch) || isNaN(roll)) {
    return error(422);
  }

  if (roll < 1 || roll > 190) {
    // Error code: -3 means wrong roll, we include upto 189 to allow for 21-23 batch + 9 foreign students (there is one in 22 batch I know)
    return json({
      registered: -3,
    });
  }

  // 19,20,21,22,23
  if (batch > 2018 && batch < 2024) {
    user_type = "student";
  } else {
    user_type = "alum";
  }

  if (batch < 1980 || batch > 2024) {
    return json({
      registered: -3, // wrong student id
    });
  }

  let otp = "";

  for (let i = 0; i < 4; ++i) {
    otp += Math.floor(Math.random() * 10).toString();
  }

  let res = await run_query(
    "SELECT * from public.add_user($1, $2, $3, $4, $5, $6) as (id uuid);",
    [username, student_id, batch, password_hash, email, user_type],
    request_event
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/users/register:121.\n" + res
      );
      return error(500);
    }

    if (res.rows[0].id === null) {
      return json({
        // username or student_id already exists
        registered: -7,
      });
    }

    const token: string = jwt.sign(
      {
        id: res.rows[0].id,
      },
      JWT_SECRET
    );

    let expire = new Date(fields[1]);
    expire = new Date(expire.getTime() + 30 * 60 * 1000);

    make_otp_cookie(request_event.cookies, token, expire);

    return json({
      registered: 0,
      time: fields[1].substring(1, fields[1].length - 1),
    });
  } else {
    return error(500);
  }
}
