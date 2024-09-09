import { JWT_SECRET } from "$env/static/private";
import { supabase_client_store } from "$lib/stores.server";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { get_user_id } from "$lib/helpers.server";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  let id = get_user_id(load_event.cookies);

  if (id === null) {
    return error(403);
  }

  const user_detail_rpc = await get(supabase_client_store).rpc(
    "get_user_details",
    {
      given_user_id: id,
    }
  );

  if (user_detail_rpc.error) {
    console.error(
      "user detail rpc error @ (user)/page.server.ts:22\n" +
        user_detail_rpc.error
    );

    return error(500); // internal server error
  }

  return {
    details: user_detail_rpc.data,
  };
}
