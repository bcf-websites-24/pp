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

  let given_offset: number = req.url.searchParams.has("offset")
    ? Number(req.url.searchParams.get("offset") as string)
    : 0;

  let res = await run_query(
    "SELECT public.get_leaderboard_chunk($1);",
    [given_offset],
    req
  );

  if (res) {
    let t: Array<any> = [];

    res.rows.forEach((element) => {
      let fields: Array<string> = element[0]
        .substring(1, element[0].length - 1)
        .split(",");

      if (fields.length != 6) {
        other_error_logger.error(
          "Error parsing db function result at api/arena/paged_leaderboard:38"
        );
        return error(500);
      }

      fields.forEach((elem) => {
        if (elem.length == 0) {
          other_error_logger.error(
            "Error parsing db function result at api/arena/paged_leaderboard:47"
          );
          return error(500);
        }
      });

      t.push({
        f_username: fields[0],
        f_curr_level: Number(fields[1]),
        f_student_id: fields[2],
        f_last_submission_time: fields[3].substring(1, fields[3].length - 1),
        f_shomobay_score: Number(fields[4]),
        f_rank: Number(fields[5]),
      });
    });
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
    return json(t);
  } else {
    return error(500);
  }
}
