import { error, json, type RequestEvent } from "@sveltejs/kit";
import { type PostgrestSingleResponse } from "@supabase/supabase-js";
import argon2 from "argon2";
import { supabase_client_store } from "$lib/stores.server";
import { get } from "svelte/store";
import { delete_jwt_cookie, make_jwt_cookie } from "$lib/helpers.server";
import jwt from "jsonwebtoken";
import { PUBLIC_JWT_SECRET } from "$env/static/public";

export async function POST(request_event: RequestEvent): Promise<Response> {
  const request: Request = request_event.request;
  const request_json: any = await request.json();
  const username: string = request_json.username;
  const student_id: string = request_json.student_id;
  const email: string = request_json.email;
  const password: string = request_json.password;
  const password_hash: string = await argon2.hash(password);

  // we need to ensure student id is a string that converts to a positive integer > 0
  // otherwise we cannot get batch from student id.
  // since we could not get a hold of BUET roll formats over time
  // we are allowing any number 
  // regex explanation: ^   : start of string
  //                    \d+ : any number, leading 0s are fine
  //                    $   : end of string
  // stackOverflow sauce 🤡: https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer#:~:text=function%20isInDesiredForm(str)%20%7B%0A%20%20%20%20return%20/%5E%5C%2B%3F%5Cd%2B%24/.test(str)%3B%0A%7D 
  if (!/^\d+$/.test(student_id)) {
    delete_jwt_cookie(request_event.cookies);

    return json({
      registered: -1,
    });
  }

  const add_user_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("add_user", {
    given_email: email,
    given_pwd_hash: password_hash,
    given_student_id: student_id,
    given_username: username,
  });

  if (add_user_rpc.error) {
    console.error(add_user_rpc.error);

    return error(500);
  }

  if (add_user_rpc.data !== null) {
    const token: string = jwt.sign(
      {
        id: add_user_rpc.data,
      },
      PUBLIC_JWT_SECRET
    );
    make_jwt_cookie(request_event.cookies, token);

    return json({
      registered: 0,
    });
  } else {
    delete_jwt_cookie(request_event.cookies);

    return json({
      registered: -1,
    });
  }
}
