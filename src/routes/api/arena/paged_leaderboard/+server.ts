import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  get_user_id,
  is_object_empty,
  is_user_banned,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function POST(req: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(req.cookies);
  if (given_user_id === null) {
    return error(401);
  }

  if (await is_user_banned(given_user_id)) {
    return error(403);
  }

  let given_offset: number;

  if (
    req.url.searchParams.has("offset") &&
    !Number.isNaN(Number(req.url.searchParams.get("offset") as string))
  ) {
    given_offset = Number(req.url.searchParams.get("offset") as string);
  } else {
    given_offset = 0;
  }

  let res = await run_query(
    "SELECT * from public.get_leaderboard_chunk($1);",
    [given_offset],
    req
  );

  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/arena/paged_leaderboard:40.\n" +
          res
      );
      return error(500);
    }
    // leaderboard in serial. Array of objects. format:
    /**
   *  [
          {
              "f_username": "test56",
              "f_curr_level": 1,
              "f_student_id": "1580257",
              "f_last_submission_time": "2024-06-26T03:13:03.054745+00:00"
              "f_rank" : 2
          }
      ]   
   */
    return json(res.rows);
  } else {
    return error(500);
  }
}
