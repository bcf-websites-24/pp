import { is_valid_admin } from "$lib/helpers.server";
import { supabase_client_store } from "$lib/stores.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(403);
  }

  const meme_list_rpc = await get(supabase_client_store).rpc("get_all_memes");

  if (meme_list_rpc.error) {
    console.error(
      "get all meme rpc error @admin/meme:14\n" + meme_list_rpc.error
    );

    return error(500);
  }

  return {
    memes: meme_list_rpc.data,
  };
}
