import { JWT_SECRET } from "$env/static/private";
import { run_query } from "$lib/db/index.server";
import {
  delete_otp_cookie,
  get_otp_id,
  get_user_id,
  make_user_cookie,
  other_error_logger,
} from "$lib/helpers.server";
import { error, json, redirect, type RequestEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

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
    "SELECT public.verify_otp($1, $2);", // send id for access token jwt
    [id, given_otp],
    request_event
  );

  if (res) {
    // write check if db res ok
    let r: string = res.rows[0][0];
    let fields: Array<string> = r.substring(1, r.length - 1).split(",");

    if (fields.length !== 2) {
      other_error_logger.error(
        "Error parsing db function result at api/users/otp:46."
      );
      return error(500);
    }

    let status: number = Number(fields[1]);

    if (Number.isNaN(status)) {
      other_error_logger.error(
        "Error parsing db function result at api/users/otp:55."
      );
      return error(500);
    }

    if (status === -5) {
      return json({
        registered: -5,
        message: "Username/email/student id already used",
      });
    } else if (status === -4) {
      return json({
        registered: -4,
        message: "User already verified",
      });
    } else if (status === -3) {
      return json({
        registered: -3,
        message: "OTP time limit exceeded",
      });
    } else if (status === -2) {
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
          id: fields[0],
        },
        JWT_SECRET
      );

      make_user_cookie(request_event.cookies, token);
      delete_otp_cookie(request_event.cookies);

      return json({
        registered: 0
      });
    } else {
      other_error_logger.error(
        "Error parsing db function result at api/users/otp:99."
      );
      return error(500);
    }
  } else {
    return error(500);
  }
}
