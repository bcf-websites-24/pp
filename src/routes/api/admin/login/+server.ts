import { error, json, type RequestEvent } from "@sveltejs/kit";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { make_admin_cookie } from "$lib/helpers.server";
import { JWT_SECRET, ADMIN_PWD_HASH, ADMIN_JWT_ID } from "$env/static/private";
import { get } from "svelte/store";
import { other_error_logger_store } from "$lib/stores.server";

export async function POST(request_event: RequestEvent): Promise<Response> {
  const request: Request = request_event.request;
  const request_json: any = await request.json();
  const password: string = request_json.password;

  if (password === undefined || password === null) {
    return error(422);
  }

  try {
    if (!(await argon2.verify(ADMIN_PWD_HASH, password))) {
      return json({
        login: -2, // password mismatch
      });
    }
  } catch (err) {
    get(other_error_logger_store).error(
      "Error while verifying hash in api/admin/login",
      err
    );
    return error(500);
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
