import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { PUBLIC_JWT_SECRET } from "$env/static/public";

export async function POST({ cookies }: RequestEvent): Promise<Response> {
  const jwt_token: string | undefined = cookies.get("pp-jwt");

  // no cookie means user is not logged in
  if (jwt_token) {
    let decoded_token: any = null;

    try {
      decoded_token = jwt.verify(jwt_token, PUBLIC_JWT_SECRET);
    } catch (err) {
      // verify error means malformed token/wrong secret
      return error(403);
    }

    let uid: string = decoded_token.id;

    // this can happen if jwt token field names were changed for example, this is a server side coding error
    if (uid === null || uid === undefined) {
      return error(500);
    }

    const can_access_admin_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("can_access_admin", {
      given_user_id: uid,
    });

    // VERCEL_LOG_SOURCE
    if (can_access_admin_rpc.error) {
      console.error("admin/leaderboard line 37\n"+can_access_admin_rpc.error);
      return error(500);
    }

    // data is single boolean value, should be true for access
    if (!can_access_admin_rpc.data) {
      return error(403);
    }

    const leaderboard_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_leaderboard_for_admins");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (leaderboard_rpc.error) {
      console.error("admin/leaderboard line 52\n"+leaderboard_rpc.error);
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
  } else {
    return error(403);
  }
}
