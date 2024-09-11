import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_valid_admin } from "$lib/helpers.server";
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
    "SELECT public.delete_puzzle($1);",
    [puzzle_id],
    req
  );
  if (res) {
    return json({
      success: res.rows[0][0],
    });
  } else {
    return error(500);
  }
}
