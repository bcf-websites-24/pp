import { get_user_id } from "$lib/helpers.server";
import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  let id = get_user_id(load_event.cookies);

  if (id !== null && id.length > 0) {
    return redirect(303, "/");
  }

  return null;
}