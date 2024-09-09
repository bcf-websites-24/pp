import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JWT_SECRET, ADMIN_JWT_ID } from "$env/static/private";
import { is_valid_admin } from "$lib/helpers.server";

/**
 * request format, formData with fields,
 *  {
        "editing" : false,
        "meme_file": file,
        "meme_id": test
    }
 */
export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  if (!is_valid_admin(cookies)) {
    return error(401);
  }

  const request_formdata: any = await request.formData();

  if (request_formdata === undefined) {
    return error(422);
  }

  const meme_file: File = request_formdata.get("meme_file") as File;
  const editing: boolean = request_formdata.get("editing") === "true";
  const given_meme_id: string = request_formdata.get("meme_id") as string;
  let meme_data: string = "";

  if (!editing) {
    if (meme_file === undefined || meme_file === null) {
      return error(422);
    }

    let given_img_url: string = (uuidv4() +
      "." +
      meme_file.name?.split(".").pop()) as string;

    const add_new_meme_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("add_new_meme", {
      given_img_url,
      given_sound_url: "",
      given_content: "",
      given_is_audio: false,
    });

    // VERCEL_LOG_SOURCE
    if (add_new_meme_rpc.error) {
      console.error("admin/meme line 57\n" + add_new_meme_rpc.error.message);

      return error(500);
    }

    const meme_file_upload_rpc: any = await get(supabase_client_store)
      .storage.from("memes")
      .upload(given_img_url, meme_file);

    // VERCEL LOG SOURCE
    if (meme_file_upload_rpc.error) {
      console.error("admin/meme line 68\n" + meme_file_upload_rpc.error);

      return error(500);
    }

    meme_data = add_new_meme_rpc.data;
  } else {
    if (given_meme_id === undefined || given_meme_id === null) {
      return error(422);
    }

    if (meme_file === undefined || meme_file === null) {
      const update_meme_rpc = await get(supabase_client_store).rpc(
        "update_meme_nofile",
        {
          given_meme_id,
        }
      );

      // VERCEL_LOG_SOURCE
      if (update_meme_rpc.error) {
        console.error("admin/meme line 89\n" + update_meme_rpc.error);
        return error(500);
      }

      meme_data = update_meme_rpc.data;
    } else {
      let given_img_url: string = (uuidv4() +
        "." +
        meme_file.name?.split(".").pop()) as string;

      const update_meme_rpc = await get(supabase_client_store).rpc(
        "update_meme",
        {
          given_id: given_meme_id,
          given_img_url: given_img_url,
        }
      );

      // VERCEL_LOG_SOURCE
      if (update_meme_rpc.error) {
        console.error("admin/meme line 109 " + update_meme_rpc.error.message);
        return error(500);
      }

      meme_data = update_meme_rpc.data;
      const meme_file_upload_rpc = await get(supabase_client_store)
        .storage.from("memes")
        .upload(given_img_url, meme_file);

      // VERCEL LOG SOURCE
      if (meme_file_upload_rpc.error) {
        console.error("admin/meme line 120\n" + meme_file_upload_rpc.error);
        return error(500);
      }
    }
  }

  return json(meme_data);
}
