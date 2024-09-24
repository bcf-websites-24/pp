import { run_query } from "$lib/db/index.server";
import { is_object_empty, is_valid_admin } from "$lib/helpers.server";
import { other_error_logger_store } from "$lib/stores.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  let res = await run_query(
    "SELECT * from public.constant_values where const_name = 'highest_puzzle_level';",
    []
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db query result at admin/raise_level/+page.server.ts.\n" +
          res
      );
      return error(500);
    }

    return {
      puzzle_level: res.rows,
    };
  } else {
    return error(500);
  }
}
