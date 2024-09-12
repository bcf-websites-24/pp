import { file_system_error_logger, is_valid_admin } from "$lib/helpers.server";
import { error, type RequestEvent } from "@sveltejs/kit";
import { readFileSync } from "fs";

export async function POST(request_event: RequestEvent): Promise<Response> {
  if (!is_valid_admin(request_event.cookies)) {
    return error(401);
  }

  const request = request_event.request;
  const request_json = await request.json();

  if (request_json.url === undefined || request_json.url === null) {
    return error(422);
  }

  try {
    const image_blob = new Blob([
      readFileSync("./bucket/Memes/" + request_json.url),
    ]);
    return new Response(image_blob);
  } catch (err) {
    file_system_error_logger.error(
      "Error reading file from disk at api/admin/meme/get_image:22.",
      err
    );
    return error(500);
  }
}
