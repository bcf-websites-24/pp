import { ADMIN_JWT_ID, JWT_SECRET } from "$env/static/private";
import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  const token = load_event.cookies.get("pp-admin-jwt");

  if (token === undefined) {
    return error(403);
  }

  let id: any;

  try {
    id = (jwt.verify(token, JWT_SECRET) as any).id;
  } catch (err) {
    return error(403);
  }

  if (id !== ADMIN_JWT_ID) {
    return error(403);
  }

  const meme_list_rpc = await get(supabase_client_store).rpc("get_all_memes");

  if (meme_list_rpc.error) {
    console.error(meme_list_rpc.error);

    return error(500);
  }

  return {
    memes: meme_list_rpc.data
  };
}