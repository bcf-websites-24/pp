import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  is_object_empty,
  is_valid_admin,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  let res = await run_query(
    "SELECT * from public.get_leaderboard_for_admins();",
    [],
    req
  );
  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/admin/leaderboard:22.\n" +
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
              "f_user_type": "staff",
              "f_student_id": "1580257",
              "f_email": "test@gmail.com",
              "f_last_submission_time": "2024-06-26T04:00:56.940797+00:00",
              "f_total_submissions": 4,
              "f_shomobay_score": 0
          }
      ]   
   */
    return json(res.rows);
  } else {
    return error(500);
  }
}
