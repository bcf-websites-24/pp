import {
  file_system_error_logger,
  get_user_id,
  is_user_banned,
} from "$lib/helpers.server";
import { error, type RequestEvent } from "@sveltejs/kit";
import { readFileSync } from "fs";

export async function POST(request_event: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(request_event.cookies);
  if (given_user_id === null) {
    return error(401);
  }

  if (await is_user_banned(given_user_id)) {
    return error(403);
  }

  const request = request_event.request;
  const request_json = await request.json();
  let filename: string = request_json.url;
  if (filename === undefined || filename === null) {
    return error(422);
  }
  let image_blob: Blob;

  try {
    image_blob = new Blob([readFileSync("./bucket/PicturePuzzle/" + filename)]);
    return new Response(image_blob);
  } catch (err) {
    file_system_error_logger.error(
      "Error reading image file/making blob at api/puzzles/get_image_data. ",
      err
    );
    return error(500);
  }
}
