import { run_query } from "$lib/db/index.server";
import {
  is_object_empty,
  is_valid_admin,
  other_error_logger,
} from "$lib/helpers.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  let res = await run_query(
    "SELECT * from public.get_leaderboard_for_admins();",
    []
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
    return {
      leaderboard: res.rows,
    };
  } else {
    return error(500);
  }
}
