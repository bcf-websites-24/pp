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

    const random_meme_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_random_meme");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (random_meme_rpc.error) {
      console.error(random_meme_rpc.error);
      return error(500);
    }

    // random meme. format:
    /**
     *  {
            "id": 2,
            "created_at": "2024-06-25T04:30:54.736549+00:00",
            "img_url": "tst",
            "sound_url": "test"
        }   
     */
    return new Response(JSON.stringify(random_meme_rpc.data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return error(403);
  }
}
