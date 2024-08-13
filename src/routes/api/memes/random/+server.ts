import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";

export async function GET({ cookies }: RequestEvent): Promise<Response> {
  const jwt_token: string | undefined = cookies.get("pp-jwt");

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

    const random_meme_rpc = await get(
      supabase_client_store
    ).rpc("get_random_meme");

    // VERCEL_LOG_SOURCE, this will be on the vercel api log
    if (random_meme_rpc.error) {
      console.error("memes/random line 35\n" + random_meme_rpc.error.message);
      return error(500);
    }

    // create limited time signed url of file
    const meme_image_rpc = await get(supabase_client_store)
      .storage.from("memes")
      .download(random_meme_rpc.data.img_url);

    // VERCEL LOG SOURCE
    if (
      meme_image_rpc.error
    ) {
      console.error("memes/random line 51\n" + meme_image_rpc.error);
      return error(500);
    }

    let meme_audio_blob: Blob | null = null;

    if (random_meme_rpc.data.sound_url !== null) {
      // create limited time signed url of file
      const meme_sound_download_rpc = await get(supabase_client_store)
        .storage.from("meme_sounds")
        .download(random_meme_rpc.data.sound_url);

      // VERCEL LOG SOURCE
      if (
        meme_sound_download_rpc.error
      ) {
        console.error("memes/random line 68\n" + meme_sound_download_rpc.error);
        return error(500);
      }

      meme_audio_blob = meme_sound_download_rpc.data;
    }

    const form_data = new FormData();

    form_data.append("id", random_meme_rpc.data.id);
    form_data.append("image", meme_image_rpc.data);

    if (meme_audio_blob) {
      form_data.append("audio", meme_audio_blob);
    }

    return new Response(form_data);
  } else {
    return error(403);
  }
}
