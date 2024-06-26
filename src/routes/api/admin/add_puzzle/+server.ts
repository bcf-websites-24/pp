import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { PUBLIC_JWT_SECRET } from "$env/static/public";

/**
 * request format:
 *  {
        "hashed_ans": "test_api",
        "info": "test info",
        "info_link": "test.com",
        "puzzle_level": 9,
        "title": ""
    }
    and puzzle_file field in formData
 */
export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  const jwt_token: string | undefined = cookies.get("pp-jwt");

  // no cookie means user is not logged in
  if (jwt_token) {
    let decoded_token: any = null;

    try {
      decoded_token = jwt.verify(jwt_token, PUBLIC_JWT_SECRET);
    } catch (err) {
      // verify error means malformed token/wrong secret
      return error(403);
    }

    let given_user_id: string = decoded_token.id;

    // this can happen if jwt token field names were changed for example, this is a server side coding error
    if (given_user_id === null || given_user_id === undefined) {
      return error(500);
    }

    const can_access_admin_rpc: PostgrestSingleResponse<any> = await get(
      supabase_client_store
    ).rpc("can_access_admin", {
      given_user_id,
    });

    // VERCEL_LOG_SOURCE
    if (can_access_admin_rpc.error) {
      console.error(can_access_admin_rpc.error);
      return error(500);
    }

    // data is single boolean value, should be true for access
    if (!can_access_admin_rpc.data) {
      return error(403);
    }

    const request_formdata: any = await request.formData();

    if (request_formdata === undefined) {
      return error(422);
    }

    const given_hashed_ans: string = request_formdata.get(
      "hashed_ans"
    ) as string;
    const given_info: string = request_formdata.get("info") as string;
    const given_info_link: string = request_formdata.get("info_link") as string;
    const given_puzzle_level: number = request_formdata.get(
      "puzzle_level"
    ) as number;
    const given_title: string = request_formdata.get("title") as string;
    const puzzle_file: File = request_formdata.get("puzzle_file") as File;

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
      given_title === undefined ||
      puzzle_file === undefined ||
      puzzle_file === null
    ) {
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
      console.error(add_new_puzzle_rpc.error);
      return error(500);
    }

    const puzzle_file_upload_rpc: any = await get(supabase_client_store)
      .storage.from("puzzles")
      .upload(given_img_url, puzzle_file);

    // VERCEL LOG SOURCE
    if (puzzle_file_upload_rpc.error) {
      console.error(puzzle_file_upload_rpc.error);
      return error(500);
    }

    /**
     * format
     *  {
          "puzzle_id": "c742e1b7-21f9-4827-ba39-34b7b53eb2e4"
        }
     */
    return json({
      puzzle_id: add_new_puzzle_rpc.data,
    });
  } else {
    return error(403);
  }
}
