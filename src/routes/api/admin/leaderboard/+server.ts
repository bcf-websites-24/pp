import { error, type RequestEvent } from "@sveltejs/kit";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  let res = await run_query(
    "SELECT public.get_leaderboard_for_admins();",
    [],
    req
  );
  if (res) {
    let t: Array<any> = [];

    res.rows.forEach((element) => {
      let r: string = element[0];
      let fields: Array<string> = r.substring(1, r.length - 1).split(",");

      if (fields.length != 8) {
        other_error_logger.error(
          "Error parsing db function result at api/admin/leaderboard:24"
        );
        return error(500);
      }

      fields.forEach((elem) => {
        if (elem.length == 0) {
          other_error_logger.error(
            "Error parsing db function result at api/admin/leaderboard:32"
          );
          return error(500);
        }
      });

      t.push({
        f_username: fields[0],
        f_curr_level: Number(fields[1]),
        f_user_type: fields[2],
        f_student_id: fields[3],
        f_email: fields[4],
        f_last_submission_time: fields[5].substring(1, fields[5].length - 1),
        f_total_submissions: Number(fields[6]),
        f_shomobay_score: Number(fields[7]),
      });
    });

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
    return new Response(JSON.stringify(t), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return error(500);
  }
}
