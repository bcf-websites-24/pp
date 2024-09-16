import { error, type ServerLoadEvent } from "@sveltejs/kit";
import {
  get_user_id,
  is_object_empty,
  is_user_banned,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  let id = get_user_id(load_event.cookies);

  if (id === null) {
    return error(401);
  }

  if (await is_user_banned(id)) {
    return error(403);
  }

  let res = await run_query(
    `select
      *
    from
      public.get_user_details
      ($1) as 
      (
        uid uuid,
        username text,
        student_id text,
        curr_level bigint,
        email text,
        user_rank bigint,
        next_puzzle_id uuid,
        next_puzzle_url text,
        next_puzzle_level bigint,
        is_banned boolean
      );`,
    [id]
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      other_error_logger.error(
        "\nError parsing db function result at (user)/+layout.server.ts:48.\n" +
          res
      );
      return error(500);
    }

    return {
      details: res.rows[0],
    };
  } else {
    return error(500);
  }
}
