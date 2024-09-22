import { error, json, type RequestEvent } from "@sveltejs/kit";
import argon2 from "argon2";
import { is_object_empty, make_otp_cookie } from "$lib/helpers.server";
import { other_error_logger_store } from "$lib/stores.server";
import jwt from "jsonwebtoken";
import validator from "validator";
import { JWT_SECRET } from "$env/static/private";
import { run_query } from "$lib/db/index.server";
import { get } from "svelte/store";
import { getOTP } from "$lib/mailer/mailer.server";

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
 *          -8  means could not send user verification mail
 *          -9  means user sent 15 otp requests already
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

  if (year > 23) {
    batch = 1900 + year;
  } else {
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
    console.log(batch);
    return json({
      registered: -3, // wrong student id
    });
  }

  let duplication_check_query = await run_query(
    `
    select * from
    public.is_duplicate($1, $2, $3);
    `,
    [username, email, student_id]
  );

  if (!duplication_check_query) {
    get(other_error_logger_store).error(
      "\nFailed to verify duplication at api/users/register:111.\n"
    );
    return error(500);
  } else {
    if (duplication_check_query.rows[0].is_duplicate === 1) {
      return json({
        // username already exists
        registered: -7,
      });
    } else if (duplication_check_query.rows[0].is_duplicate === 2) {
      return json({
        // email already exists
        registered: -10,
      });
    } else if (duplication_check_query.rows[0].is_duplicate === 3) {
      return json({
        // student_id already exists
        registered: -11,
      });
    }
  }
  let otp = "";

  let request_count_res = await run_query(
    "select count(o.id) as otp_request_count from public.otp o where o.email = $1;",
    [email]
  );

  if (!request_count_res) {
    get(other_error_logger_store).error(
      "\nFailed to count user's previous request for OTP verification at api/users/register:141.\n"
    );
    return error(500);
  } else {
    if (request_count_res.rows[0].otp_request_count > 15) {
      return json({
        registered: -9, // -9  means user sent 15 otp requests already
      });
    }
  }

  try {
    otp = await getOTP(username, email);
  } catch (err) {
    get(other_error_logger_store).error(
      "\nFailed to send user mail for OTP verification at api/users/register:156.\n",
      err
    );
    return json({
      registered: -8, // -8 means could not send user verification mail
    });
  }

  // getOTP("test user", "af@lfaoinci.com");
  let res = await run_query(
    "SELECT * from public.add_temp_user($1, $2, $3, $4, $5, $6, $7, $8) as (id uuid, time timestamptz);",
    [
      username,
      student_id,
      batch,
      password_hash,
      email,
      user_type,
      otp,
      request_event.getClientAddress(),
    ],
    request_event
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/users/register:189.\n" + res
      );
      return error(500);
    }

    const token: string = jwt.sign(
      {
        id: res.rows[0].id,
      },
      JWT_SECRET
    );

    let expire = new Date(res.rows[0].time);
    expire = new Date(expire.getTime() + 30 * 60 * 1000);

    make_otp_cookie(request_event.cookies, token, expire);

    return json({
      registered: 0,
      time: expire,
    });
  } else {
    return error(500);
  }
}
