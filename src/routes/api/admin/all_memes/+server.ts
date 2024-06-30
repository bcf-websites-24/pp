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
      console.error("admin/leaderboard line 37\n" + can_access_admin_rpc.error);
      return error(500);
    }

    // data is single boolean value, should be true for access
    if (!can_access_admin_rpc.data) {
      return error(403);
    }

    const meme_list_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_all_memes");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (meme_list_rpc.error) {
      console.error("admin/all_memes line 52\n" + meme_list_rpc.error);
      return error(500);
    }

    // memes in serial of creation time. Array of objects. format:
    /**
     *  [
            {
                "f_created_at": "2024-06-26T07:46:38.652019+00:00",
                "f_img_url": "de28065e-da39-4c88-a00c-b1e9da441c2f.jpg",
                "f_sound_url": "de28065e-da39-4c88-a00c-b1e9da441c2f.jpg",
                "f_content": "test",
                "f_is_audio": false,
                "f_id": "512b711e-6d9c-480e-a353-043bf7a37931"
            }
        ]      
     */
    return new Response(JSON.stringify(meme_list_rpc.data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return error(403);
  }
}
