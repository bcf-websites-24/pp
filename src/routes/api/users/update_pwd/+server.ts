import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  get_user_id,
  is_object_empty,
  is_user_banned,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { other_error_logger_store } from "$lib/stores.server";
import { get } from "svelte/store";
import argon2 from "argon2";
import type { QueryResult } from "pg";

// 0, successful, -1 otp mismatch, -2 30 min time over,-3 email not registered
// for forgot pwd case
export async function POST(req: RequestEvent): Promise<Response> {
  let request_json = await req.request.json();

  let given_is_reset: boolean = request_json.is_reset;
  let given_new_password: string = request_json.new_password;

  if (
    given_is_reset === undefined ||
    given_is_reset === null ||
    given_new_password === undefined ||
    given_new_password === null
  ) {
    return error(422);
  }

  let given_new_pwd_hash: string = await argon2.hash(given_new_password);

  let result: QueryResult<any>;

  if (given_is_reset) {
    let given_email: string = request_json.email;
    let given_otp: string = request_json.otp;

    let inputs: Array<string> = [given_email, given_otp];

    inputs.forEach((element) => {
      if (element === undefined || element === null) {
        return error(422);
      }
    });

    let pwd_reset_query = await run_query(
      `select * from public.update_user_pwd_otp($1, $2, $3);`,
      [given_email, given_otp, given_new_pwd_hash],
      req
    );

    if (!pwd_reset_query) {
      return error(500);
    } else {
      result = pwd_reset_query;

      if (
        result.rowCount === 0 ||
        (result.rowCount !== 0 && is_object_empty(result.rows[0]) !== false)
      ) {
        get(other_error_logger_store).error(
          "\nError parsing password reset query result at api/users/update_pwd.\n" +
            result
        );
        return error(500);
      }

      let status: number =
        result.rows[0].update_user_pwd_otp === 1
          ? 0
          : result.rows[0].update_user_pwd_otp;

      // 0: successful, -1 otp mismatch, -2 30 min time over,-3 email not registered
      return json({
        updated: status,
      });
    }
  } else {
    let given_user_id: string | null = get_user_id(req.cookies);

    if (given_user_id === null) {
      return error(401);
    }

    if (await is_user_banned(given_user_id)) {
      return error(403);
    }

    let given_old_password = request_json.old_password;
    let username = request_json.username;

    if (
      given_old_password === undefined ||
      given_old_password === null ||
      username === undefined ||
      username === null
    ) {
      return error(422);
    }

    let res = await run_query(
      "SELECT * from public.get_uuid_hash($1);",
      [username],
      req
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

      if (!(await argon2.verify(hash, given_old_password))) {
        return json({
          updated: -4, // old password mismatch
        });
      }
    } else {
      return error(500);
    }

    let pwd_update_query = await run_query(
      `select * from public.update_user_pwd ($1, $2);`,
      [given_user_id, given_new_pwd_hash],
      req
    );

    if (!pwd_update_query) {
      return error(500);
    } else {
      result = pwd_update_query;
      if (
        result.rowCount === 0 ||
        (result.rowCount !== 0 && is_object_empty(result.rows[0]) !== false)
      ) {
        get(other_error_logger_store).error(
          "\nError parsing password update query result at api/users/update_pwd.\n" +
            result
        );
        return error(500);
      }
      return json({
        updated: result.rows[0].update_user_pwd,
      });
    }
  }
}
