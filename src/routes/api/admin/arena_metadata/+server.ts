import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  let res = await run_query("SELECT public.get_arena_metadata();", [], req);

  if (res) {
    if (
      res.rows[0][0] === null ||
      res.rows[0][0] === undefined ||
      res.rows[0][0].length === 0
    ) {
      other_error_logger.error(
        "Error parsing db function result at api/admin/arena_metadata:18"
      );
      return error(500);
    }

    let fields: Array<string> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length != 8) {
      other_error_logger.error(
        "Error parsing db function result at api/admin/arena_metadata:30"
      );
      return error(500);
    }

    fields.forEach((element) => {
      if (element.length == 0) {
        other_error_logger.error(
          "Error parsing db function result at api/admin/arena_metadata:38"
        );
        return error(500);
      }
    });

    /**
     *{
        "total_users": 1011,
        "total_staff": 0,
        "total_alums": 6,
        "total_students": 1005,
        "total_submissions": 109,
        "total_puzzles": 13,
        "max_user_level": 16,
        "total_memes": 3
      }
     */
    return json({
      total_users: Number(fields[0]),
      total_staff: Number(fields[1]),
      total_alums: Number(fields[2]),
      total_students: Number(fields[3]),
      total_submissions: Number(fields[4]),
      total_puzzles: Number(fields[5]),
      max_user_level: Number(fields[6]),
      total_memes: Number(fields[7]),
    });
  } else {
    return error(500);
  }
}
