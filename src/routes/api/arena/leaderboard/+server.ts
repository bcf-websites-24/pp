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

  const leaderboard_rpc = await get(supabase_client_store).rpc(
    "get_leaderboard"
  );

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (leaderboard_rpc.error) {
    console.error("arena/leaderboard line 18\n" + leaderboard_rpc.error);
    return error(500);
  }

  // leaderboard in serial. Array of objects. format:
  /**
   *  [
          {
              "f_username": "test56",
              "f_curr_level": 1,
              "f_student_id": "1580257",
              "f_last_submission_time": "2024-06-26T03:13:03.054745+00:00"
          }
      ]   
   */
  return json(leaderboard_rpc.data);
}
