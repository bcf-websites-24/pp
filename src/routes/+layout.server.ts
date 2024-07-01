import { JWT_SECRET } from "$env/static/private";
import { supabase_client_store } from "$lib/stores.server";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  const null_details = { details: null };
  const token = load_event.cookies.get("pp-jwt");

  if (token === undefined) {
    return null_details;
  }

  let id: any;

  try {
    id = (jwt.verify(token, JWT_SECRET) as any).id;
  } catch (err) {
    return null_details;
  }

  const user_detail_rpc = await get(
    supabase_client_store
  ).rpc("get_user_details", {
    given_user_id: id,
  });

  if (user_detail_rpc.error) {
    console.error("layout data 35\n" + user_detail_rpc.error);

    return error(500);	// internal server error
  }

  return (
    {
      details: user_detail_rpc.data
    }
  );
}