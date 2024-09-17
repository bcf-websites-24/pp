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
    `select
    *
    from
    public.get_arena_metadata() as (
    total_users bigint,
    total_staff bigint,
    total_alums bigint,
    total_students bigint,
    total_submissions bigint,
    total_puzzles bigint,
    max_user_level bigint,
    total_memes bigint
    );`,
    [],
    req
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/admin/arena_metadata:38.\n" +
          res
      );
      return error(500);
    }

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
    return json(res.rows[0]);
  } else {
    return error(500);
  }
}
