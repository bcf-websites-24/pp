import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { PUBLIC_JWT_SECRET } from "$env/static/public";
/**
 * request format:
 *  {
        "img_url": "test.com",
        "sound_url": "test info",
        "content": ""
    }
 */
export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
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

    let given_user_id: string = decoded_token.id;

    // this can happen if jwt token field names were changed for example, this is a server side coding error
    if (given_user_id === null || given_user_id === undefined) {
      return error(500);
    }

    const can_access_admin_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("can_access_admin", {
      given_user_id,
    });
    
    // VERCEL_LOG_SOURCE
    if (can_access_admin_rpc.error) {
      console.error(can_access_admin_rpc.error);
      return error(500);
    }

    // data is single boolean value, should be true for access
    if (!can_access_admin_rpc.data) {
      return error(403);
    }

    const request_json: any = await request.json();
    const given_img_url: string = request_json.img_url;
    const given_content: string = request_json.content;
    const given_sound_url: string = request_json.sound_url;

    // client side did not give correct request fields
    if (
      given_img_url === undefined ||
      given_img_url === null ||
      given_content === null ||
      given_content === undefined ||
      given_sound_url === null ||
      given_sound_url === undefined
    ) {
      return error(422);
    }

    const add_new_meme: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("add_new_meme", {
      given_content,
      given_img_url,
      given_sound_url,
    });

    // VERCEL_LOG_SOURCE
    if (add_new_meme.error) {
      console.error(add_new_meme.error);
      return error(500);
    }
    /**
     * format
     *  {
            "meme_id": 3
        }
     */
    return json({
      meme_id: add_new_meme.data,
    });
  } else {
    return error(403);
  }
}