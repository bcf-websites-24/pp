import { is_valid_admin } from "$lib/helpers.server";
import { supabase_client_store } from "$lib/stores.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  const admin_leaderboard_data = await get(supabase_client_store).rpc(
    "get_leaderboard_for_admins"
  );

  if (admin_leaderboard_data.error) {
    console.error(
      "admin leaderboard rpc call error @admin/page.server.ts 14\n" +
      admin_leaderboard_data.error
    );

    return error(500); // internal server error
  }

  return {
    leaderboard: admin_leaderboard_data.data,
  };
}
