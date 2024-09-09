import { is_valid_admin } from "$lib/helpers.server";
import { supabase_client_store } from "$lib/stores.server";
import { error, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function POST(request_event: RequestEvent): Promise<Response> {
  if (!is_valid_admin(request_event.cookies)) {
    return error(401);
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
