import { is_valid_admin } from "$lib/helpers.server";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { readFileSync } from "fs";
import { file_system_error_logger } from "$lib/helpers.server";

export async function POST(request_event: RequestEvent): Promise<Response> {
  if (!is_valid_admin(request_event.cookies)) {
    return error(401);
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
      "Error reading image file/making blob at api/admin/puzzle/get_image. ",
      err
    );
    return error(500);
  }
}
