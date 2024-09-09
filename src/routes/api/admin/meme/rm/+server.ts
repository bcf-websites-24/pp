import { supabase_client_store } from "$lib/stores.server";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { is_valid_admin } from "$lib/helpers.server";

export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  if (!is_valid_admin(cookies)) {
    return error(401);
  }

  const request_json: any = await request.json();
  const meme_id: string = request_json.meme_id;

  if (meme_id === undefined || meme_id === null) {
    return error(422);
  }

  const del_meme_rpc = await get(supabase_client_store).rpc("delete_meme", {
    given_id: meme_id,
  });

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (del_meme_rpc.error) {
    console.error("memes/rmv_meme line 25\n" + del_meme_rpc.error.message);

    return error(500);
  }

  return json({
    success: del_meme_rpc.data,
    // file_blob: ret_text,
  });
}
