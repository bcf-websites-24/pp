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

  const user_next_puzzle_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("get_user_next_puzzle", {
    given_user_id: uid,
  });

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (user_next_puzzle_rpc.error) {
    console.error("puzzles/next_puzzle line 37\n" + user_next_puzzle_rpc.error);
    return error(500);
  }

  // this happens if uid does not exist in table
  if (
    user_next_puzzle_rpc.data.id === "" ||
    user_next_puzzle_rpc.data.img_url === "" ||
    user_next_puzzle_rpc.data.puzzle_level === ""
  ) {
    return error(500);
  }

  // download file in backend, make an array of numbers from it
  // const puzzle_file_download_rpc: any = await get(supabase_client_store)
  //   .storage.from("puzzles")
  //   .download(user_next_puzzle_rpc.data.img_url);

  // create limited time signed url of file
  const puzzle_file_download_rpc: any = await get(supabase_client_store)
    .storage.from("puzzles")
    .createSignedUrl(user_next_puzzle_rpc.data.img_url, 12 * 60 * 60);

  // VERCEL LOG SOURCE
  if (
    puzzle_file_download_rpc.error ||
    puzzle_file_download_rpc.data.signedUrl === undefined ||
    puzzle_file_download_rpc.data.signedUrl === null
  ) {
    console.error("puzles/next_puzzle line 66\n" + puzzle_file_download_rpc.error);
    return error(500);
  }

  // let file_buffer: ArrayBuffer | undefined =
  //   await puzzle_file_download_rpc.data?.arrayBuffer();
  // let ret_text: any = Array.from(new Uint8Array(file_buffer as ArrayBuffer));

  /**
   * format:
   *  {
        "puzzle_id": "6130b8f1-4415-4648-ba49-e4ec61a74c20",
        "img_url": "test",
        "level": 1
      }
   */
  return json({
    puzzle_id: user_next_puzzle_rpc.data.id,
    img_url: puzzle_file_download_rpc.data.signedUrl,
    level: user_next_puzzle_rpc.data.puzzle_level,
    // file_blob: ret_text,
  });
}
