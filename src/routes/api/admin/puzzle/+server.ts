import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { v4 as uuidv4 } from "uuid";
import { is_valid_admin } from "$lib/helpers.server";

/**
 * request format, formData with fields,
 *  {
        "hashed_ans": "test_api",
        "info_link": "test.com",
        "puzzle_level": 9,
        "editing" : false,
        "puzzle_file": file,
        "puzzle_id": test
    }
 */
export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  if (!is_valid_admin(cookies)) {
    return error(403);
  }

  const request_formdata: any = await request.formData();

  if (request_formdata === undefined) {
    return error(422);
  }

  const given_hashed_ans: string = request_formdata.get("hashed_ans") as string;
  const given_info: string = "";
  const given_info_link: string = request_formdata.get("info_link") as string;
  const given_puzzle_level: number = parseInt(
    request_formdata.get("puzzle_level")
  );

  const given_title: string = "";
  const puzzle_file: File = request_formdata.get("puzzle_file") as File;
  const editing: boolean = request_formdata.get("editing") === "true";
  const given_puzzle_id: string = request_formdata.get("puzzle_id") as string;

  // client side did not give correct request fields
  if (
    given_hashed_ans === null ||
    given_hashed_ans === undefined ||
    given_info === null ||
    given_info === undefined ||
    given_info_link === null ||
    given_info_link === undefined ||
    given_puzzle_level === null ||
    given_puzzle_level === undefined ||
    given_title === null ||
    given_title === undefined
  ) {
    return error(422);
  }

  let puzzle_data: string = "";

  if (!editing) {
    if (puzzle_file === undefined || puzzle_file === null) {
      return error(422);
    }

    let given_img_url: string = (uuidv4() +
      "." +
      puzzle_file.name?.split(".").pop()) as string;

    const add_new_puzzle_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("add_new_puzzle", {
      given_hashed_ans,
      given_img_url,
      given_info,
      given_info_link,
      given_puzzle_level,
      given_title,
    });

    // VERCEL_LOG_SOURCE
    if (add_new_puzzle_rpc.error) {
      console.error("admin/puzzle line 85\n" + add_new_puzzle_rpc.error);
      return error(500);
    }

    const puzzle_file_upload_rpc: any = await get(supabase_client_store)
      .storage.from("puzzles")
      .upload(given_img_url, puzzle_file);

    // VERCEL LOG SOURCE
    if (puzzle_file_upload_rpc.error) {
      console.error("admin/puzzle line 95\n" + puzzle_file_upload_rpc.error);
      return error(500);
    }

    puzzle_data = add_new_puzzle_rpc.data;
  } else {
    if (given_puzzle_id === undefined || given_puzzle_id === null) {
      return error(422);
    }

    if (puzzle_file === undefined || puzzle_file === null) {
      const update_puzzle_rpc: PostgrestSingleResponse<any> = await get(
        supabase_client_store
      ).rpc("update_puzzle_nofile", {
        given_hashed_ans,
        given_info,
        given_info_link,
        given_puzzle_id,
        given_puzzle_level,
        given_title,
      });

      // VERCEL_LOG_SOURCE
      if (update_puzzle_rpc.error) {
        console.error("admin/puzzle line 119\n" + update_puzzle_rpc.error);
        return error(500);
      }

      puzzle_data = update_puzzle_rpc.data;
    } else {
      let given_img_url: string = (uuidv4() +
        "." +
        puzzle_file.name?.split(".").pop()) as string;

      const update_puzzle_rpc: PostgrestSingleResponse<any> = await get(
        supabase_client_store
      ).rpc("update_puzzle", {
        given_hashed_ans: given_hashed_ans,
        given_id: given_puzzle_id,
        given_img_url: given_img_url,
        given_info: given_info,
        given_info_link: given_info_link,
        given_puzzle_level: given_puzzle_level,
        given_title: given_title,
      });

      // VERCEL_LOG_SOURCE
      if (update_puzzle_rpc.error) {
        console.error(
          "admin/puzzle line 166 " + update_puzzle_rpc.error.message
        );
        return error(500);
      }

      puzzle_data = update_puzzle_rpc.data;
      const puzzle_file_upload_rpc: any = await get(supabase_client_store)
        .storage.from("puzzles")
        .upload(given_img_url, puzzle_file);

      // VERCEL LOG SOURCE
      if (puzzle_file_upload_rpc.error) {
        console.error("admin/puzzle line 156\n" + puzzle_file_upload_rpc.error);
        return error(500);
      }
    }
  }

  return json(puzzle_data);
}
