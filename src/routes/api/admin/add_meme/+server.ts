import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { PUBLIC_JWT_SECRET } from "$env/static/public";
/**
 * request format, formData
 *  {
        "content": "",
        "meme_image" : file,
        "meme_sound" : file
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
      console.error("admin/add_meme line 48\n" + can_access_admin_rpc.error);
      return error(500);
    }

    // data is single boolean value, should be true for access
    if (!can_access_admin_rpc.data) {
      return error(403);
    }

    const request_formdata: any = await request.formData();
    const given_content: string = request_formdata.get("content") as string;
    const meme_sound: File = request_formdata.get("meme_sound") as File;
    const meme_image: File = request_formdata.get("meme_image") as File;

    // client side did not give correct request fields
    if (
      given_content === null ||
      given_content === undefined ||
      ((meme_image === null || meme_image === undefined) &&
        (meme_sound === null || meme_sound === undefined))
    ) {
      return error(422);
    }

    let given_img_url: string = "";
    let given_sound_url: string = "";

    if (meme_image) {
      given_img_url = (uuidv4() +
        "." +
        meme_image.name?.split(".").pop()) as string;
      const meme_image_upload_rpc: any = await get(supabase_client_store)
        .storage.from("memes")
        .upload(given_img_url, meme_image);

      // VERCEL LOG SOURCE
      if (meme_image_upload_rpc.error) {
        console.error("admin/add_meme line 85\n" + meme_image_upload_rpc.error);
        return error(500);
      }
    }
    if (meme_sound) {
      given_sound_url = (uuidv4() +
        "." +
        meme_sound.name?.split(".").pop()) as string;
      const meme_sound_upload_rpc: any = await get(supabase_client_store)
        .storage.from("meme_sounds")
        .upload(given_sound_url, meme_sound);

      // VERCEL LOG SOURCE
      if (meme_sound_upload_rpc.error) {
        console.error("admin/add_meme line 99\n" + meme_sound_upload_rpc.error);
        return error(500);
      }
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
      console.error("admin/add_meme line 114" + add_new_meme.error);
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
