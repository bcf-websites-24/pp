import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { is_valid_admin } from "$lib/helpers.server";

export async function POST({ cookies }: RequestEvent): Promise<Response> {
  if (!is_valid_admin(cookies)) {
    return error(403);
  }

  const leaderboard_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("get_leaderboard_for_admins");

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (leaderboard_rpc.error) {
    console.error("admin/leaderboard line 40\n" + leaderboard_rpc.error);
    return error(500);
  }

  // leaderboard in serial. Array of objects. format:
  /**
   *  [
          {
              "f_username": "test56",
              "f_curr_level": 1,
              "f_user_type": "staff",
              "f_student_id": "1580257",
              "f_email": "test@gmail.com",
              "f_last_submission_time": "2024-06-26T04:00:56.940797+00:00",
              "f_total_submissions": 4,
              "f_shomobay_score": 0
          }
      ]   
   */
  return new Response(JSON.stringify(leaderboard_rpc.data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
