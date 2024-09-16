import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  is_object_empty,
  is_valid_admin,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

/**
 * @example request: {puzzle_id : 'b62fec79-f6f8-41f1-a282-c2ae1c42690b'}, succesful deletion response: {success: 1}. Failed deletion response: {success: 0}
 */
export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  const request_json: any = await req.request.json();
  const puzzle_id: string = request_json.puzzle_id;

  if (puzzle_id === undefined || puzzle_id === null) {
    return error(422);
  }
  let res = await run_query(
    "SELECT * from public.delete_puzzle($1) as (success integer);",
    [puzzle_id],
    req
  );
  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      other_error_logger.error(
        "\nError parsing db function result at api/admin/puzzles/rm:31.\n" + res
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
