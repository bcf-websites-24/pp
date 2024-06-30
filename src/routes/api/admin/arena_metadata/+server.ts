import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { PUBLIC_JWT_SECRET } from "$env/static/public";
import { ADMIN_JWT_ID } from "$env/static/private";

export async function POST({ cookies }: RequestEvent): Promise<Response> {
  const jwt_token: string | undefined = cookies.get("pp-admin-jwt");

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

    if (uid !== ADMIN_JWT_ID) {
      return error(403);
    }

    const get_arena_metadata_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_arena_metadata");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (get_arena_metadata_rpc.error) {
      console.error(
        "admin/arena_metadata line 41\n" + get_arena_metadata_rpc.error
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
  } else {
    return error(403);
  }
}
