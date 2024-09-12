import { error, type ServerLoadEvent } from "@sveltejs/kit";
import {
  get_user_id,
  is_user_banned,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  let id = get_user_id(load_event.cookies);

  if (id === null) {
    return error(401);
  }

  if (await is_user_banned(id)) {
    return error(403);
  }

  let res = await run_query("SELECT public.get_user_details($1);", [id]);

  if (res) {
    let fields: Array<any> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length !== 10 || fields[0] === "" || fields[1] === "") {
      other_error_logger.error(
        "Error at routes/(user)/layout.server.ts:31. Possible wrong user id or db function result parsing error."
      );
      return error(500);
    }

    return {
      details: {
        uid: fields[0],
        username: fields[1],
        student_id: fields[2],
        curr_level: Number(fields[3]),
        email: fields[4],
        user_rank: Number(fields[5]),
        next_puzzle_id: fields[6],
        next_puzzle_url: fields[7],

        next_puzzle_level: Number(fields[8]),
        is_banned: fields[9] === "t" ? true : false,
      },
    };
  } else {
    return error(500);
  }
}
