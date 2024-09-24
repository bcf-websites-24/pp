import { JWT_SECRET } from "$env/static/private";
import { run_query } from "$lib/db/index.server";
import {
  delete_otp_cookie,
  get_otp_id,
  get_user_id,
  make_user_cookie,
} from "$lib/helpers.server";
import { other_error_logger_store } from "$lib/stores.server";
import { error, json, redirect, type RequestEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { get } from "svelte/store";

export async function POST(request_event: RequestEvent): Promise<Response> {
  let id = get_user_id(request_event.cookies);

  if (id !== null && id.length > 0) {
    return redirect(303, "/");
  }

  id = get_otp_id(request_event.cookies);

  if (id === undefined || id === null || id.length === 0) {
    return error(403);
  }

  const request_json: any = await request_event.request.json();
  const given_otp: string = request_json.otp;

  if (given_otp === undefined || given_otp === null || given_otp.length != 4) {
    return error(422);
  }

  let res = await run_query(
    "SELECT * from public.verify_otp($1, $2) as (id uuid, status integer);", // send id for access token jwt
    [id, given_otp],
    request_event
  );

  if (res) {
    // write check if db res ok

    let status: number = Number(res.rows[0].status);

    if (Number.isNaN(status)) {
      get(other_error_logger_store).error(
        "Error parsing db function result at api/users/otp:55."
      );
      return error(500);
    }

    if (status === -7) {
      delete_otp_cookie(request_event.cookies);
      return json({
        registered: -7,
        message: "Email already used",
      });
    } else if (status === -6) {
      delete_otp_cookie(request_event.cookies);
      return json({
        registered: -6,
        message: "Student ID already used",
      });
    } else if (status === -5) {
      delete_otp_cookie(request_event.cookies);
      return json({
        registered: -5,
        message: "Username already used",
      });
    } else if (status === -4) {
      delete_otp_cookie(request_event.cookies);
      return json({
        registered: -4,
        message: "User already verified",
      });
    } else if (status === -3) {
      delete_otp_cookie(request_event.cookies);
      return json({
        registered: -3,
        message: "OTP time limit exceeded",
      });
    } else if (status === -2) {
      delete_otp_cookie(request_event.cookies);
      return json({
        registered: -2,
        message: "User doesn't exist",
      });
    } else if (status === -1) {
      return json({
        registered: -1,
        message: "OTP mismatch",
      });
    } else if (status === 0) {
      const token: string = jwt.sign(
        {
          id: res.rows[0].id,
        },
        JWT_SECRET
      );

      make_user_cookie(request_event.cookies, token);
      delete_otp_cookie(request_event.cookies);

      return json({
        registered: 0,
      });
    } else {
      get(other_error_logger_store).error(
        "Error parsing db function result at api/users/otp:99."
      );
      return error(500);
    }
  } else {
    return error(500);
  }
}
