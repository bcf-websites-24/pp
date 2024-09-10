import { get_user_id } from "$lib/helpers.server";
import { supabase_client_store } from "$lib/stores.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (get_user_id(load_event.cookies) === null) {
    return error(401);
  }

  let page_param = load_event.url.searchParams.get("page");
  let given_offset: number;

  if (page_param === null) {
    given_offset = 0;
  } else {
    given_offset = parseInt(page_param);

    if (isNaN(given_offset)) {
      given_offset = 0;
    } else {
      given_offset -= 1;
    }
  }

  const paged_leaderboard_rpc = await get(supabase_client_store).rpc(
    "get_leaderboard_chunk",
    { given_offset }
  );

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (paged_leaderboard_rpc.error) {
    console.error(
      "(user)/leaderboard/+page.server.ts:34",
      paged_leaderboard_rpc.error
    );
    return error(500);
  }

  const leaderboard_metadata_rpc = await get(supabase_client_store).rpc(
    "get_leaderboard_details"
  );

  // VERCEL_LOG_SOURCE, this will be on the vercel api log
  if (leaderboard_metadata_rpc.error) {
    console.error(
      "(user)/leaderboard/+page.server.ts line 42",
      leaderboard_metadata_rpc.error
    );
    return error(500);
  }

  return {
    players: paged_leaderboard_rpc.data,
    metadata: leaderboard_metadata_rpc.data,
  };
}
