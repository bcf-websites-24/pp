import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { is_valid_admin } from "$lib/helpers.server";

export async function POST({ cookies }: RequestEvent): Promise<Response> {
  if (!is_valid_admin(cookies)) {
    return error(401);
  }

  const get_arena_metadata_rpc = await get(supabase_client_store).rpc(
    "get_arena_metadata"
  );

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (get_arena_metadata_rpc.error) {
    console.error(
      "admin/arena_metadata line 19\n" + get_arena_metadata_rpc.error
    );
    return error(500);
  }

  // format:
  /**
   *  {
          "total_users": 10,
          "total_staff": 1,
          "total_alums": 5,
          "total_students": 4,
          "total_submissions": 6,
          "total_puzzles": 3,
          "max_user_level": 1,
          "total_memes": 2
      } 
   */
  return new Response(JSON.stringify(get_arena_metadata_rpc.data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
