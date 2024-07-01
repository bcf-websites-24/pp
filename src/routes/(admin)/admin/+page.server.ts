import { JWT_SECRET } from "$env/static/private";
import { supabase_client_store } from "$lib/stores.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  const null_details = { leaderboard: null };
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

  const user_detail_rpc = await get(supabase_client_store).rpc("get_leaderboard_for_admins");

  if (user_detail_rpc.error) {
    console.error("layout data 35\n" + user_detail_rpc.error);

    return error(500);	// internal server error
  }

  return (
    {
      leaderboard: user_detail_rpc.data
    }
  );
}