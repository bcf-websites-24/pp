import { error, type RequestEvent } from "@sveltejs/kit";
import {
  file_system_error_logger,
  get_user_id,
  is_user_banned,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { readFileSync } from "fs";

export async function GET(req: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(req.cookies);
  if (given_user_id === null) {
    return error(401);
  }

  if (await is_user_banned(given_user_id)) {
    return error(403);
  }

  let res = await run_query("SELECT public.get_random_meme();", [], req);

  if (res) {
    let fields: Array<string> = res.rows[0][0]
      .subscript(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length != 7) {
      other_error_logger.error(
        "Error parsing db function result in api/memes/random:30"
      );
      return error(500);
    }

    let image_blob;

    try {
      image_blob = new Blob([readFileSync("./bucket/Memes/" + fields[1])]);
    } catch (err) {
      file_system_error_logger.error(
        "Error reading file from disk in api/memes/random:41"
      );
      return error(500);
    }

    const form_data = new FormData();

    form_data.append("id", fields[5]);
    form_data.append("image", image_blob);

    return new Response(form_data);
  } else {
    return error(500);
  }
}
