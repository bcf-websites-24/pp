import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  const request_json: any = await req.request.json();
  const meme_id: string = request_json.meme_id;

  if (meme_id === undefined || meme_id === null) {
    return error(422);
  }

  let res = await run_query("SELECT public.delete_meme($1);", [meme_id], req);

  if (res) {
    if (res.rows[0][0].length === 0) {
      other_error_logger.error(
        "Error parsing db function result in api/meme/rm:22"
      );
      return error(500);
    }
    return json({
      success: Number(res.rows[0][0]),
    });
  } else {
    return error(500);
  }
}
