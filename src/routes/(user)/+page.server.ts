import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import {
  delete_user_cookie,
  get_user_id,
  is_object_empty,
  is_user_banned,
} from "$lib/helpers.server";
import { other_error_logger_store } from "$lib/stores.server";
import { run_query } from "$lib/db/index.server";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  let id = get_user_id(load_event.cookies);

  if (id === null) {
    return error(401);
  } else if (id.length === 0) {
    return redirect(303, "/login");
  }

  if (await is_user_banned(id)) {
    return error(403);
  }

  let res = await run_query(
    `select
      *
    from
      public.get_user_details
      ($1) as 
      (
        uid uuid,
        username text,
        student_id text,
        curr_level bigint,
        email text,
        user_rank bigint,
        next_puzzle_id uuid,
        next_puzzle_url text,
        next_puzzle_level bigint,
        is_banned boolean
      );`,
    [id]
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && (is_object_empty(res.rows[0]) !== false || res.rows[0]["uid"] === null))
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at (user)/+layout.server.ts:52.\n" +
        res
      );

      delete_user_cookie(load_event.cookies);

      return redirect(303, "/login");
    }

    return {
      details: res.rows[0],
    };
  } else {
    return error(500);
  }
}
