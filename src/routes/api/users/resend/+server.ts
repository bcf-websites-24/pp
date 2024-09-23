import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  delete_otp_cookie,
  get_otp_id,
  is_object_empty,
  make_otp_cookie,
} from "$lib/helpers.server";
import { other_error_logger_store } from "$lib/stores.server";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import { run_query } from "$lib/db/index.server";
import { get } from "svelte/store";
import { getOTP } from "$lib/mailer/mailer.server";

export async function GET(request_event: RequestEvent): Promise<Response> {
  const temp_user_id = get_otp_id(request_event.cookies);
  let username: string;
  let email: string;

  if (!temp_user_id) {
    return error(401);
  }

  let temp_user_existence_query = await run_query(
    `select * from public.otp o where o.id = $1`,
    [temp_user_id]
  );

  if (!temp_user_existence_query) {
    get(other_error_logger_store).error(
      "\nFailed to verify user existence in api/users/resend, database error happened"
    );
    return error(500);
  } else {
    if (
      temp_user_existence_query.rowCount === 0 ||
      (temp_user_existence_query.rowCount !== 0 &&
        is_object_empty(temp_user_existence_query.rows[0]) !== false) ||
      temp_user_existence_query.rows[0].id === null
    ) {
      return error(401);
    }
    username = temp_user_existence_query.rows[0].username;
    email = temp_user_existence_query.rows[0].email;
  }

  let otp = "";

  let request_count_res = await run_query(
    "select count(o.id) as otp_request_count from public.otp o where o.email = $1;",
    [email]
  );

  if (!request_count_res) {
    get(other_error_logger_store).error(
      "\nFailed to count user's previous request for OTP verification at api/users/resend.\n"
    );
    return error(500);
  } else {
    if (request_count_res.rows[0].otp_request_count > 15) {
      return json({
        registered: -1, // -1  means user sent 15 otp requests already
      });
    }
  }

  try {
    otp = await getOTP(username, email);
  } catch (err) {
    get(other_error_logger_store).error(
      "\nFailed to send user mail for OTP verification at api/users/register:119.\n",
      err
    );
    return json({
      registered: -2, // -2 means could not send user verification mail
    });
  }

  // getOTP("test user", "af@lfaoinci.com");
  let res = await run_query(
    "update public.otp o set otp = $1 where o.id = $2 returning *;",
    [otp, temp_user_id],
    request_event
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) ||
      res.rows[0].id === null
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/users/register:104.\n" + res
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

    delete_otp_cookie(request_event.cookies);
    make_otp_cookie(request_event.cookies, token, expire);

    return json({
      registered: 0,
      time: expire,
    });
  } else {
    return error(500);
  }
}
