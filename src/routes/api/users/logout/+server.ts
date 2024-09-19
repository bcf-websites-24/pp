import { delete_user_cookie, get_user_id } from "$lib/helpers.server";
import { error, redirect, type RequestEvent } from "@sveltejs/kit";

export async function GET(request_event: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(request_event.cookies);
  if (given_user_id === null) {
    return error(401);
  } else if (given_user_id.length === 0) {
    return redirect(303, "/login");
  }

  delete_user_cookie(request_event.cookies);

  return new Response();
}
