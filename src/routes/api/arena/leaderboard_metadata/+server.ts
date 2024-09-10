import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { get_user_id, is_user_banned } from "$lib/helpers.server";

export async function POST({ cookies }: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(cookies);
  if (given_user_id === null) {
    return error(401);
  }

  if (await is_user_banned(given_user_id)) {
    return error(403);
  }

  const leaderboard_metadata_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("get_leaderboard_details()");

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (leaderboard_metadata_rpc.error) {
    console.error(
      "arena/leaderboard_metadata line 18\n" + leaderboard_metadata_rpc.error
    );
    return error(500);
  }

  // leaderboard in serial. Array of objects. format:
  /**
   *  {
        leaderboard_length : 994
      }
  
   */
  return json(leaderboard_metadata_rpc.data);
}
