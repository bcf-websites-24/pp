import { STORAGE_CDN_ENDPOINT } from "$env/static/private";
import {
  get_user_id,
  is_user_banned,
} from "$lib/helpers.server";
import { error, type RequestEvent } from "@sveltejs/kit";

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

  let image_blob: Blob = await (await fetch(`${STORAGE_CDN_ENDPOINT}/puzzle/${filename}`)).blob();

  return new Response(image_blob);
}
