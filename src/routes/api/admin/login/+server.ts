import { json, type RequestEvent } from "@sveltejs/kit";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { make_admin_cookie } from "$lib/helpers.server";
import { JWT_SECRET, ADMIN_PWD_HASH, ADMIN_JWT_ID } from "$env/static/private";

export async function POST(request_event: RequestEvent): Promise<Response> {
  const request: Request = request_event.request;
  const request_json: any = await request.json();
  const password: string = request_json.password;

  if (!(await argon2.verify(ADMIN_PWD_HASH, password))) {
    return json({
      login: -2, // password mismatch
    });
  }

  const token: string = jwt.sign(
    {
      id: ADMIN_JWT_ID,
    },
    JWT_SECRET
  );

  make_admin_cookie(request_event.cookies, token);

  return json({
    login: 0, // success
  });
}
