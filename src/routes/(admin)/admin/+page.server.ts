import { is_valid_admin } from "$lib/helpers.server";
import { supabase_client_store } from "$lib/stores.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(403);
  }

  const user_detail_rpc = await get(supabase_client_store).rpc("get_leaderboard_for_admins");

  if (user_detail_rpc.error) {
    console.error("layout data 35\n" + user_detail_rpc.error);

    return error(500);	// internal server error
  }

  return (
    {
      leaderboard: user_detail_rpc.data
    }
  );
}