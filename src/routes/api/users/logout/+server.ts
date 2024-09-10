import {
  delete_user_cookie,
  get_user_id,
  is_user_banned,
} from "$lib/helpers.server";
import { error, type RequestEvent } from "@sveltejs/kit";

export async function GET(request_event: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(request_event.cookies);
  if (given_user_id === null) {
    return error(401);
  }

  if (await is_user_banned(given_user_id)) {
    return error(403);
  }

  delete_user_cookie(request_event.cookies);

  return new Response();
}
