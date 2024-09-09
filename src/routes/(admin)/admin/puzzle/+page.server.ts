import { is_valid_admin } from "$lib/helpers.server";
import { supabase_client_store } from "$lib/stores.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  const puzzle_list_rpc = await get(supabase_client_store).rpc(
    "get_all_puzzles"
  );

  if (puzzle_list_rpc.error) {
    console.error(
      "get all puzzles rpc error @admin/puzzle:14\n" + puzzle_list_rpc.error
    );

    return error(500);
  }

  return {
    puzzles: puzzle_list_rpc.data,
  };
}
