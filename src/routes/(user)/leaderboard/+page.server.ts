import { run_query } from "$lib/db/index.server";
import {
  get_user_id,
  is_object_empty,
  is_user_banned,
  other_error_logger,
} from "$lib/helpers.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  const id = get_user_id(load_event.cookies);

  if (id === null) {
    return error(401);
  }

  if (await is_user_banned(id)) {
    return error(403);
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

  let res = await run_query("SELECT * from public.get_leaderboard_chunk($1);", [
    given_offset,
  ]);

  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at (user)/leaderboard/+page.server.ts:45.\n" +
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
        "\nError parsing db function result at (user)/leaderboard/+page.server.ts:63.\n" +
          res2
      );
      return error(500);
    }

    s = res2.rows[0].leaderboard_length;
  } else {
    return error(500);
  }

  return {
    players: t,
    metadata: s,
  };
}
