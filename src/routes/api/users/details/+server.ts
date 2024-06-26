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

    const user_detail_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_user_details", {
      given_user_id: uid,
    });

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (user_detail_rpc.error) {
      console.error("users/details 37\n" + user_detail_rpc.error);
      return error(500);
    }

    // this may happens if uid does not exist in table
    if (
      user_detail_rpc.data.id === "" ||
      user_detail_rpc.data.username === ""
    ) {
      return error(500);
    }

    /**
     * format:
     *  {
          "uid": "5ad4d6eb-e96a-4765-8193-f60579817bd7",
          "username": "test56",
          "student_id": "1580257",
          "email": "test@gmail.com",
          "current_level": 0,
          "current_position": 1
        }
     */
    return json({
      uid: user_detail_rpc.data.id,
      username: user_detail_rpc.data.username,
      student_id: user_detail_rpc.data.student_id,
      email: user_detail_rpc.data.email,
      current_level: user_detail_rpc.data.curr_level,
      current_position: user_detail_rpc.data.current_position,
    });
  } else {
    return error(403);
  }
}
