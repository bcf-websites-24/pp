import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { get_user_id } from "$lib/helpers.server";

export async function POST({ cookies, url }: RequestEvent): Promise<Response> {
  if (get_user_id(cookies) === null) {
    return error(401);
  }

  let given_offset: number = url.searchParams.has("offset")
    ? Number(url.searchParams.get("offset") as string)
    : 0;
  const paged_leaderboard_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("get_leaderboard_chunk", { given_offset });

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (paged_leaderboard_rpc.error) {
    console.error(
      "arena/paged_leaderboard line 18\n" + paged_leaderboard_rpc.error
    );
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
              "f_rank" : 2
          }
      ]   
   */
  return json(paged_leaderboard_rpc.data);
}
