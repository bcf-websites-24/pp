import { supabase_client_store } from "$lib/stores.server";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { is_valid_admin } from "$lib/helpers.server";

export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  if (!is_valid_admin(cookies)) {
    return error(401);
  }

  const request_json: any = await request.json();
  const puzzle_id: string = request_json.puzzle_id;

  if (puzzle_id === undefined || puzzle_id === null) {
    return error(422);
  }

  const del_puzzle_rpc = await get(supabase_client_store).rpc("delete_puzzle", {
    given_id: puzzle_id,
  });

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (del_puzzle_rpc.error) {
    console.error("puzzles/rmv_puzzle line 52\n" + del_puzzle_rpc.error);
    return error(500);
  }

  return json({
    success: del_puzzle_rpc.data,
    // file_blob: ret_text,
  });
}