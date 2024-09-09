import { delete_admin_cookie, is_valid_admin } from "$lib/helpers.server";
import { error, type RequestEvent } from "@sveltejs/kit";

export async function GET(request_event: RequestEvent): Promise<Response> {
  if (!is_valid_admin(request_event.cookies)) {
    return error(403);
  }

  delete_admin_cookie(request_event.cookies);

  return new Response();
}