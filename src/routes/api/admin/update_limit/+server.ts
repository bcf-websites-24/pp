import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_object_empty, is_valid_admin } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { other_error_logger_store } from "$lib/stores.server";
import { get } from "svelte/store";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  const request_json: any = await req.request.json();
  const given_level: number = Number(request_json.highest_puzzle_level);
  if (
    given_level === undefined ||
    given_level === null ||
    isNaN(given_level) ||
    given_level <= 0
  ) {
    return error(422);
  }

  let res = await run_query(
    `
    update 
      public.constant_values 
    set 
      const_value = $1 
    where 
      const_name = 'highest_puzzle_level'
    returning *;
    `,
    [given_level],
    req
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db query result at api/admin/update_limit.\n" + res
      );
      return error(500);
    }

    return json(res.rows);
  } else {
    return error(500);
  }
}
