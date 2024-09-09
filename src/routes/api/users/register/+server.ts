import { error, json, type RequestEvent } from "@sveltejs/kit";
import { type PostgrestSingleResponse } from "@supabase/supabase-js";
import argon2 from "argon2";
import { supabase_client_store } from "$lib/stores.server";
import { get } from "svelte/store";
import { make_user_cookie } from "$lib/helpers.server";
import jwt from "jsonwebtoken";
import validator from "validator";
import { JWT_SECRET } from "$env/static/private";

/**
 *
 * @param request_event
 * @returns  0  successful registration
 *          -1  database error
 *          -2  student id is not numeric
 *          -3  student id has roll out of range [1,183]
 *          -4  username has space/non alphanumeric character, not allowing it
 * UNUSED   -5  non cse dept
 *          -6  invalid email address
 */
export async function POST(request_event: RequestEvent): Promise<Response> {
  const request: Request = request_event.request;
  const request_json: any = await request.json();
  const username: string = request_json.username;
  const student_id: string = request_json.student_id;
  const email: string = request_json.email;
  const password: string = request_json.password;
  const password_hash: string = await argon2.hash(password);

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

  // we need to ensure student id is a string that converts to a positive integer > 0
  // otherwise we cannot get batch from student id.
  // since we could not get a hold of BUET roll formats over time
  // we are setting rolls as 9 digit: ie.201905000 or 199805000
  // regex explanation: ^   : start of string
  //                    \d{9} : 9 digit number, leading 0s fine
  //                    $   : end of string
  // stackOverflow sauce 🤡: https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer#:~:text=function%20isInDesiredForm(str)%20%7B%0A%20%20%20%20return%20/%5E%5C%2B%3F%5Cd%2B%24/.test(str)%3B%0A%7D
  if (!/^\d{9}$/.test(student_id)) {
    // Error code -2 means roll is not numeric
    return json({
      registered: -2,
    });
  }

  let batch: number = Number(student_id.substring(0, 4));
  // let dept: number = Number(student_id.substring(5, 7));
  // let roll: number = Number(student_id.substring(7, 9));
  let user_type: string = "";

  // if (roll < 1 || roll > 183) {
  //   // Error code: -3 means wrong roll, we include 183 to allow for 21-23 batch + 3 foreign students (there is one in 22 batch I know)
  //   return json({
  //     registered: -3,
  //   });
  // }

  // 19,20,21,22,23
  if (batch > 2018 && batch < 2024) {
    user_type = "student";
  } else {
    user_type = "alum";
  }

  // if (dept !== 5) {
  //   delete_jwt_cookie(request_event.cookies);

  //   // Error code: -5 means non cse dept
  //   return json({
  //     registered: -5,
  //   });
  // }

  const add_user_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("add_user", {
    given_batch: batch,
    given_email: email,
    given_pwd_hash: password_hash,
    given_student_id: student_id,
    given_username: username,
    given_user_type: user_type,
  });

  if (add_user_rpc.error) {
    console.error("users/register line 101\n" + add_user_rpc.error);

    return error(500);
  }

  if (add_user_rpc.data !== null) {
    const token: string = jwt.sign(
      {
        id: add_user_rpc.data,
      },
      JWT_SECRET
    );
    make_user_cookie(request_event.cookies, token);

    return json({
      registered: 0,
    });
  } else {
    // Database error
    return error(500);
  }
}
