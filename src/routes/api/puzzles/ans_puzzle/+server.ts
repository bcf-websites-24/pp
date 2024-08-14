import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { get_user_id } from "$lib/helpers.server";

/**
 * request format:
 *  {
      "puzzle_id": "6130b8f1-4415-4648-ba49-e4ec61a74c20",
      "ans": "test2"
    }
 */
export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(cookies);

  if (given_user_id === null) {
    return error(403);
  }

  const request_json: any = await request.json();
  const given_puzzle_id: string = request_json.puzzle_id;
  let given_ans: string = request_json.ans;
  given_ans = given_ans.trim().toLowerCase();

  // this can happen if jwt token field names were changed for example, this is a server side coding error
  if (given_user_id === null || given_user_id === undefined) {
    return error(500);
  }

  // client side did not give correct request fields
  if (
    given_puzzle_id === null ||
    given_puzzle_id === undefined ||
    given_ans === undefined ||
    given_ans === null
  ) {
    return error(422);
  }

  const add_puzzle_attempt_rpc: PostgrestSingleResponse<any> = await get(
    supabase_client_store
  ).rpc("add_puzzle_attempt", {
    given_ans,
    given_puzzle_id,
    given_user_id,
  });

  // VERCEL_LOG_SOURCE
  if (add_puzzle_attempt_rpc.error) {
    console.error("puzzles/ans_puzzle line 62\n" + add_puzzle_attempt_rpc.error.message);
    return error(500);
  }

  // response format
  //  {
  //     "is_correct_ans": false
  //  }
  return json({
    ans: add_puzzle_attempt_rpc.data[0],
  });
}
