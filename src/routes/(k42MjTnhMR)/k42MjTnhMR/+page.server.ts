import { run_query } from "$lib/db/index.server";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  let res = await run_query("SELECT public.get_leaderboard_for_admins();", []);

  if (res) {
    let t: Array<any> = [];

    res.rows.forEach((element) => {
      let r: string = element[0];
      let fields: Array<string> = r.substring(1, r.length - 1).split(",");

      if (fields.length != 8) {
        other_error_logger.error(
          "Error parsing db function result at routes/(admin)/admin/server.ts:24"
        );
        return error(500);
      }

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
    return {
      leaderboard: t,
    };
  } else {
    return error(500);
  }
}
