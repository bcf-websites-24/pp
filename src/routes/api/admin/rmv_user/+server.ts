import { supabase_client_store } from "$lib/stores.server";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { is_valid_admin } from "$lib/helpers.server";

export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  if (!is_valid_admin(cookies)) {
    return error(403);
  }

  const request_json: any = await request.json();
  const user_id: string = request_json.user_id;

  if (user_id === undefined || user_id === null) {
    return error(422);
  }

  const del_user_rpc = await get(supabase_client_store).rpc("delete_user", {
    given_id: user_id,
  });

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (del_user_rpc.error) {
    console.error("users/rmv_user line 27\n" + del_user_rpc.error.message);

    return error(500);
  }

  return json({
    success: del_user_rpc.data,
    // file_blob: ret_text,
  });
}
