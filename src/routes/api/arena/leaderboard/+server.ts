import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
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

    const leaderboard_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_leaderboard");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (leaderboard_rpc.error) {
      console.error("arena/leaderboard line 35\n" + leaderboard_rpc.error);
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
  } else {
    return error(403);
  }
}
