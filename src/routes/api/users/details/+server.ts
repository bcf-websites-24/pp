import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { get_user_id } from "$lib/helpers.server";

export async function POST({ cookies }: RequestEvent): Promise<Response> {
  let uid = get_user_id(cookies);

  if (uid === null) {
    return error(403);
  }

  const user_detail_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("get_user_details", {
    given_user_id: uid,
  });

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (user_detail_rpc.error) {
    console.error("users/details 22\n" + user_detail_rpc.error);
    return error(500);
  }

  // this may happens if uid does not exist in table
  if (user_detail_rpc.data.id === "" || user_detail_rpc.data.username === "") {
    return error(500);
  }

  // create limited time signed url of file
  const puzzle_file_download_rpc: any = await get(supabase_client_store)
    .storage.from("puzzles")
    .createSignedUrl(user_detail_rpc.data.next_puzzle_url, 12 * 60 * 60);

  // VERCEL LOG SOURCE
  if (
    puzzle_file_download_rpc.error ||
    puzzle_file_download_rpc.data.signedUrl === undefined ||
    puzzle_file_download_rpc.data.signedUrl === null
  ) {
    console.error(
      "puzles/next_puzzle line 43\n" + puzzle_file_download_rpc.error
    );
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
    next_puzzle_url: puzzle_file_download_rpc.data.signedUrl,
    next_puzzle_id: user_detail_rpc.data.next_puzzle_id,
    next_puzzle_level: user_detail_rpc.data.next_puzzle_level,
  });
}
