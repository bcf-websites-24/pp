import { delete_user_cookie, get_user_id } from "$lib/helpers.server";
import { error, type RequestEvent } from "@sveltejs/kit";

export async function GET(request_event: RequestEvent): Promise<Response> {
  let uid = get_user_id(request_event.cookies);

  if (uid === null) {
    return error(401);
  }

  delete_user_cookie(request_event.cookies);

  return new Response();
}