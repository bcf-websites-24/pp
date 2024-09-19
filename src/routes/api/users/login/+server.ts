import { error, json, redirect, type RequestEvent } from "@sveltejs/kit";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  is_object_empty,
  make_user_cookie,
  other_error_logger,
} from "$lib/helpers.server";
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
    "SELECT * from public.get_uuid_hash($1);",
    [username],
    request_event
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/users/login:39.\n" + res
      );
      return error(500);
    }

    let id: string = res.rows[0].id;
    let hash: string = res.rows[0].hash;
    let is_banned: boolean = res.rows[0].is_banned;

    if (id === null || id === undefined || id.length < 36) {
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
