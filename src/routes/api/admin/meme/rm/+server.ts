import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import { ADMIN_JWT_ID } from "$env/static/private";

export async function POST({ request, cookies, }: RequestEvent): Promise<Response> {
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

    const request_json: any = await request.json();
    const meme_id: string = request_json.meme_id;

    if (meme_id === undefined || meme_id === null) {
      return error(422);
    }

    const del_meme_rpc: PostgrestSingleResponse<any> = await get(supabase_client_store)
      .rpc("delete_meme", {
        given_id: meme_id,
      });

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (del_meme_rpc.error) {
      console.error("memes/rmv_meme line 52\n" + del_meme_rpc.error.message);

      return error(500);
    }

    return json({
      success: del_meme_rpc.data,
      // file_blob: ret_text,
    });
  } else {
    return error(403);
  }
}
