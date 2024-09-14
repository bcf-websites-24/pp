import { error, json, redirect, type RequestEvent } from "@sveltejs/kit";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { make_user_cookie, other_error_logger } from "$lib/helpers.server";
import { JWT_SECRET } from "$env/static/private";
import { run_query } from "$lib/db/index.server";

export async function POST(request_event: RequestEvent): Promise<Response> {
  const request: Request = request_event.request;
  const request_json: any = await request.json();
  const username: string = request_json.username;
  const password: string = request_json.password;

  if (
    username === undefined ||
    username === null ||
    password === undefined ||
    password === null
  ) {
    return error(422);
  }

  let res = await run_query(
    "SELECT public.get_uuid_hash($1);",
    [username],
    request_event
  );

  if (res) {
    let fields: Array<string> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split('"');

    if (fields.length != 3) {
      other_error_logger.error(
        "Error parsing db function call result at api/users/login:38." + res
      );
      return error(500);
    }

    let id: string = fields[0].substring(0, fields[0].length - 1);
    let hash: string = fields[1];
    let is_banned: boolean = fields[2].substring(1) === "t" ? true : false;

    if (id.length < 36) {
      return json({
        login: -1, // user not found
      });
    }

    if (!(await argon2.verify(hash, password))) {
      return json({
        login: -2, // password mismatch
      });
    }

    if (is_banned) {
      return json({
        login: -3, // banned user
      });
    }

    const token: string = jwt.sign({
      id: id,
    },
      JWT_SECRET
    );

    make_user_cookie(request_event.cookies, token);

    return json({
      login: 0,
    });
  } else {
    return error(500);
  }
}
