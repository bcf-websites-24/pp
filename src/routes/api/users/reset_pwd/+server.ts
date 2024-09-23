import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_object_empty } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { other_error_logger_store } from "$lib/stores.server";
import { get } from "svelte/store";
import { getOTP } from "$lib/mailer/mailer.server";
import argon2 from "argon2";

export async function POST(req: RequestEvent): Promise<Response> {
  let request_json = await req.request.json();

  let given_email = request_json.email;

  if (given_email === null || given_email === undefined) {
    return error(422);
  }

  let user_exists_query = await run_query(
    `select * from public.users u where u.email = $1;`,
    [given_email],
    req
  );

  if (!user_exists_query) {
    get(other_error_logger_store).error(
      "\nError querying user existence at api/users/pwd.\n"
    );
    return error(500);
  } else {
    if (
      user_exists_query.rowCount === 0 ||
      (user_exists_query.rowCount !== 0 &&
        is_object_empty(user_exists_query.rows[0] !== false)) ||
      user_exists_query.rows[0].id === null
    ) {
      return json({
        reset: -1, // unregistered mail
      });
    }

    let pwd_reset_otp: string = "";
    try {
      pwd_reset_otp = await getOTP(
        user_exists_query.rows[0].username,
        given_email,
        true
      );
    } catch (err) {
      get(other_error_logger_store).error(
        "\nFailed to send user mail for password reset OTP at api/users/pwd:156.\n",
        err
      );
      return json({
        reset: -2, // -2 means could not send reset password mail
      });
    }

    let hashed_reset_otp = argon2.hash(pwd_reset_otp);

    let add_reset_otp_query = await run_query(
      `insert into public.password_reset_otp (email, reset_otp) values($1, $2) returning *;`,
      [given_email, hashed_reset_otp],
      req
    );

    if (!add_reset_otp_query) {
      return error(500);
    } else {
      if (
        add_reset_otp_query.rowCount === 0 ||
        (add_reset_otp_query.rowCount !== 0 &&
          is_object_empty(add_reset_otp_query.rows[0]) !== false) ||
        add_reset_otp_query.rows[0].id === null
      ) {
        get(other_error_logger_store).error(
          "\nError parsing query result at api/users/pwd.\n" +
            add_reset_otp_query
        );
        return error(500);
      }

      return json({
        reset: 0, // password reset otp added successfully
      });
    }
  }
}
