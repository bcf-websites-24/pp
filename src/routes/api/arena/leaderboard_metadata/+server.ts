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

  let res = await run_query(
    "SELECT * from public.get_leaderboard_details() as (leaderboard_length bigint);",
    [],
    req
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/arena/leaderboard_metadata:32.\n" +
          res
      );
      return error(500);
    }

    // leaderboard length. format:
    /**
   *  {
        leaderboard_length : 994
      }
   */
    return json({
      leaderboard_length: res.rows[0].leaderboard_length,
    });
  } else {
    return error(500);
  }
}
