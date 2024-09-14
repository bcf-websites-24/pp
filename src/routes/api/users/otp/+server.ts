import { JWT_SECRET } from "$env/static/private";
import { run_query } from "$lib/db/index.server";
import { delete_otp_cookie, get_otp_id, get_user_id, make_user_cookie } from "$lib/helpers.server";
import { error, redirect, type RequestEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

export async function POST(request_event: RequestEvent): Promise<Response> {
  let id = get_user_id(request_event.cookies);

  if (id !== null && id.length > 0) {
    return redirect(303, "/");
  }

  id = get_otp_id(request_event.cookies);

  let res = await run_query(
    "SELECT public.verify_otp($1);",  // send id for access token jwt
    [id], request_event
  );

  if (res) {
    // write check if db res ok

    const token: string = jwt.sign(
      {
        id: res.rows[0][0],
      },
      JWT_SECRET
    );

    make_user_cookie(request_event.cookies, token);
    delete_otp_cookie(request_event.cookies);

    return redirect(303, "/");
  } else {
    return error(500);
  }
}