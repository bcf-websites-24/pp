import { is_valid_admin } from "$lib/helpers.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  return {
    leaderboard: 1,
  };
}
