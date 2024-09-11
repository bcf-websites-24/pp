import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  get_user_id,
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
    "SELECT public.get_leaderboard_details();",
    [],
    req
  );

  if (res) {
    let r: string = res.rows[0][0];

    if (r === undefined || r === null || r.length === 0) {
      other_error_logger.error(
        "Error parsing db function result at api/arena/leaderboard_metadata:30"
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
      leaderboard_length: Number(r.substring(1, r.length - 1)),
    });
  } else {
    return error(500);
  }
}
