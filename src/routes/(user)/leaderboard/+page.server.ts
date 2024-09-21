import { run_query } from "$lib/db/index.server";
import {
  delete_user_cookie,
  get_user_id,
  is_object_empty,
  is_user_banned,
} from "$lib/helpers.server";
import { other_error_logger_store } from "$lib/stores.server";
import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  const id = get_user_id(load_event.cookies);

  if (id === null) {
    return error(401);
  } else if (id.length === 0) {
    return redirect(303, "/login");
  }

  if (await is_user_banned(id)) {
    return error(403);
  }

  let data: any = {};
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
      res.rowCount == 0 ||
      (res?.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at (user)/leaderboard/+page.server.ts:52.\n" +
          res
      );
      return error(500);
    }
    data.details = res.rows[0];
  } else {
    delete_user_cookie(load_event.cookies);
    return error(500);
  }

  let page_param = load_event.url.searchParams.get("page");
  let given_offset: number;

  if (page_param === null) {
    given_offset = 0;
  } else {
    given_offset = parseInt(page_param);

    if (isNaN(given_offset)) {
      given_offset = 0;
    } else {
      given_offset -= 1;
    }
  }

  let t: Array<any> = [];
  res = await run_query("SELECT * from public.get_leaderboard_chunk($1);", [
    given_offset,
  ]);

  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at (user)/leaderboard/+page.server.ts:85.\n" +
          res
      );
      return error(500);
    }
    t = res.rows;
  } else {
    return error(500);
  }

  let res2 = await run_query(
    "SELECT * from public.get_leaderboard_details() as (leaderboard_length bigint);",
    []
  );
  let s;
  if (res2) {
    if (res2.rowCount !== 0 && is_object_empty(res2.rows[0]) !== false) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at (user)/leaderboard/+page.server.ts:103.\n" +
          res2
      );
      return error(500);
    }

    s = res2.rows[0].leaderboard_length;
  } else {
    return error(500);
  }

  data.players = t;
  data.metadata = s;

  return data;
}
