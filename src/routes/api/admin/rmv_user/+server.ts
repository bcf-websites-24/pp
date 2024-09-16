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

  const request_json: any = await req.request.json();
  const user_id: string = request_json.user_id;

  if (user_id === undefined || user_id === null) {
    return error(422);
  }

  let res = await run_query(
    "SELECT * from public.delete_user($1) as (success integer);",
    [user_id],
    req
  );
  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      other_error_logger.error(
        "\nError parsing db function result at api/admin/rmv_user:32.\n" + res
      );
      return error(500);
    }

    return json({
      success: res.rows[0].success,
    });
  } else {
    return error(500);
  }
}
