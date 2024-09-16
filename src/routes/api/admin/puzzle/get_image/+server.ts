import { is_valid_admin } from "$lib/helpers.server";
import { error, type RequestEvent } from "@sveltejs/kit";
import { PUBLIC_STORAGE_CDN_ENDPOINT } from "$env/static/public";

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

  let image_blob: Blob = await (
    await fetch(`${PUBLIC_STORAGE_CDN_ENDPOINT}/puzzle/${filename}`)
  ).blob();

  return new Response(image_blob);
}
