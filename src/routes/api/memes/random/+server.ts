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

    const random_meme_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("get_random_meme");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (random_meme_rpc.error) {
      console.error(random_meme_rpc.error);
      return error(500);
    }

    
    // create limited time signed url of file
    const meme_file_download_rpc: any = await get(supabase_client_store)
      .storage.from("memes")
      .createSignedUrl(random_meme_rpc.data.img_url, 12 * 60 * 60);

    // VERCEL LOG SOURCE
    if (
      meme_file_download_rpc.error ||
      meme_file_download_rpc.data.signedUrl === undefined ||
      meme_file_download_rpc.data.signedUrl === null
    ) {
      console.error("line 50"+meme_file_download_rpc.error);
      return error(500);
    }

    let sound_url: string = "";
    if (random_meme_rpc.data.sound_url !== null) {
      // create limited time signed url of file
      const meme_sound_download_rpc: any = await get(supabase_client_store)
        .storage.from("meme_sounds")
        .createSignedUrl(random_meme_rpc.data.sound_url, 12 * 60 * 60);

      // VERCEL LOG SOURCE
      if (
        meme_sound_download_rpc.error ||
        meme_sound_download_rpc.data.signedUrl === undefined ||
        meme_sound_download_rpc.data.signedUrl === null
      ) {
        console.error(meme_sound_download_rpc.error);
        return error(500);
      }

      sound_url = meme_sound_download_rpc.data.signedUrl;
    }

    // random meme. format:
    /**
     *  {
            "id": 2
            "img_url": "tst",
            "sound_url": "test"
        }   
     */
    return json({
      id: random_meme_rpc.data.id,
      img_url: meme_file_download_rpc.data.signedUrl,
      sound_url,
    });
  } else {
    return error(403);
  }
}
