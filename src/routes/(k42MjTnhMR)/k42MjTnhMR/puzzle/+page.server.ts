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

  let res = await run_query("SELECT * from public.get_all_puzzles();", []);

  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      other_error_logger.error(
        "\nError parsing db function result at admin/puzzle/+page.server.ts:19.\n" +
          res
      );
      return error(500);
    }

    return {
      puzzles: res.rows,
    };
  } else {
    return error(500);
  }
}
