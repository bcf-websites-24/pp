import { JWT_SECRET } from "$env/static/private";
import { supabase_client_store } from "$lib/stores.server";
import { error, type RequestEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { get } from "svelte/store";

export async function POST(request_event: RequestEvent): Promise<Response> {
  const jwt_token: string | undefined = request_event.cookies.get("pp-admin-jwt");

  // no cookie means user is not logged in
  if (jwt_token) {
    try {
      jwt.verify(jwt_token, JWT_SECRET);
    } catch (err) {
      // verify error means malformed token/wrong secret
      return error(403);
    }
  } else {
    // user not logged in
    return error(403);
  }

  const request = request_event.request;
  const request_json = await request.json();
  const image_blob = await get(supabase_client_store)
    .storage.from("puzzles")
    .download(request_json.url);

  if (image_blob.error) {
    console.error("puzzles/get_image_data line 28\n" + image_blob.error);

    return error(500);
  }

  return new Response(image_blob.data);
}
