import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { PUBLIC_JWT_SECRET } from "$env/static/public";
import { ADMIN_JWT_ID } from "$env/static/private";

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
  const jwt_token: string | undefined = cookies.get("pp-admin-jwt");

  // no cookie means user is not logged in
  if (jwt_token) {
    let decoded_token: any = null;

    try {
      decoded_token = jwt.verify(jwt_token, PUBLIC_JWT_SECRET);
    } catch (err) {
      // verify error means malformed token/wrong secret
      return error(403);
    }

    let uid: string = decoded_token.id;

    // this can happen if jwt token field names were changed for example, this is a server side coding error
    if (uid === null || uid === undefined) {
      return error(500);
    }

    if (uid !== ADMIN_JWT_ID) {
      return error(403);
    }

    const request_formdata: any = await request.formData();

    if (request_formdata === undefined) {
      return error(422);
    }

    const given_hashed_ans: string = request_formdata.get(
      "hashed_ans"
    ) as string;
    const given_info: string = '';
    const given_info_link: string = request_formdata.get("info_link") as string;
    const given_puzzle_level: number = request_formdata.get(
      "puzzle_level"
    ) as number;
    const given_title: string = '';
    const puzzle_file: File = request_formdata.get("puzzle_file") as File;
    const editing: boolean = request_formdata.get("editing") as boolean;
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

    let puzzle_uuid: string = "";

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
        console.error("admin/puzzle line 113" + add_new_puzzle_rpc.error);
        return error(500);
      }

      const puzzle_file_upload_rpc: any = await get(supabase_client_store)
        .storage.from("puzzles")
        .upload(given_img_url, puzzle_file);

      // VERCEL LOG SOURCE
      if (puzzle_file_upload_rpc.error) {
        console.error("admin/puzzle line 123" + puzzle_file_upload_rpc.error);
        return error(500);
      }

      puzzle_uuid = add_new_puzzle_rpc.data;
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
          console.error("admin/puzzle line 113" + update_puzzle_rpc.error);
          return error(500);
        }

        puzzle_uuid = update_puzzle_rpc.data;
      } else {
        let given_img_url: string = (uuidv4() +
          "." +
          puzzle_file.name?.split(".").pop()) as string;

        const update_puzzle_rpc: PostgrestSingleResponse<any> = await get(
          supabase_client_store
        ).rpc("update_puzzle", {
          given_hashed_ans,
          given_img_url,
          given_info,
          given_info_link,
          given_puzzle_id,
          given_puzzle_level,
          given_title,
        });

        // VERCEL_LOG_SOURCE
        if (update_puzzle_rpc.error) {
          console.error("admin/puzzle line 113" + update_puzzle_rpc.error);
          return error(500);
        }
        
        puzzle_uuid = update_puzzle_rpc.data;
        const puzzle_file_upload_rpc: any = await get(supabase_client_store)
          .storage.from("puzzles")
          .upload(given_img_url, puzzle_file);

        // VERCEL LOG SOURCE
        if (puzzle_file_upload_rpc.error) {
          console.error("admin/puzzle line 123" + puzzle_file_upload_rpc.error);
          return error(500);
        }
      }
    }

    /**
       * format
       *  {
            "puzzle_id": "c742e1b7-21f9-4827-ba39-34b7b53eb2e4"
          }
       */
    return json({
      puzzle_id: puzzle_uuid,
    });
  } else {
    return error(403);
  }
}
