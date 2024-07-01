import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import { ADMIN_JWT_ID } from "$env/static/private";

export async function POST({ cookies }: RequestEvent): Promise<Response> {
  const jwt_token: string | undefined = cookies.get("pp-admin-jwt");

  // no cookie means user is not logged in
  if (jwt_token) {
    let decoded_token: any = null;

    try {
      decoded_token = jwt.verify(jwt_token, JWT_SECRET);
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

    const puzzle_list_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_all_puzzles");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (puzzle_list_rpc.error) {
      console.error("admin/all_puzzles line 40\n" + puzzle_list_rpc.error);
      return error(500);
    }

    // puzzles in serial of puzzle level. Array of objects. format:
    /**
     *  [
            {
                "f_id": "512b711e-6d9c-480e-a353-043bf7a37931",
                "f_created_at": "2024-06-26T07:46:38.652019+00:00",
                "f_img_url": "de28065e-da39-4c88-a00c-b1e9da441c2f.jpg",
                "f_ans": "test_api",
                "f_puzzle_level": 1,
                "f_title": "test title",
                "f_info": "test info",
                "f_info_link": "test.com"
            }
        ]      
     */
    return new Response(JSON.stringify(puzzle_list_rpc.data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return error(403);
  }
}
