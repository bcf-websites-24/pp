import { run_query } from "$lib/db/index.server";
import {
  get_user_id,
  is_object_empty,
  is_user_banned,
  other_error_logger,
} from "$lib/helpers.server";
import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";

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
  let res = await run_query("SELECT public.get_user_details($1);", [id]);

  if (res) {
    let fields: Array<any> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length !== 10 || fields[0] === "" || fields[1] === "") {
      other_error_logger.error(
        "Error at routes/(user)/layout.server.ts:31. Possible wrong user id or db function result parsing error."
      );
      return error(500);
    }

    data.details = {
      uid: fields[0],
      username: fields[1],
      student_id: fields[2],
      curr_level: Number(fields[3]),
      email: fields[4],
      user_rank: Number(fields[5]),
      next_puzzle_id: fields[6] === "" ? null : fields[6],
      next_puzzle_url: fields[7],

      next_puzzle_level: Number(fields[8]),
      is_banned: fields[9] === "t" ? true : false,
    }
  } else {
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

  data.players = t;
  data.metadata = s;

  return data;
}
