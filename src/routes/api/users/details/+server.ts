import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  get_user_id,
  is_user_banned,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function POST(req: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(req.cookies);
  if (given_user_id === null) {
    return error(401);
  }

  if (await is_user_banned(given_user_id)) {
    return error(403);
  }

  let res = await run_query(
    "SELECT public.get_user_details($1);",
    [given_user_id],
    req
  );

  if (res) {
    let fields: Array<any> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length !== 10 || fields[0] === "" || fields[1] === "") {
      other_error_logger.error(
        "Error at api/users/details:31. Possible wrong user id or db function result parsing error."
      );
      return error(500);
    }

    /**
       * {
            "uid": "724a2d08-b10d-4035-85cf-878943ee3fec",
            "username": "Mobile1",
            "student_id": "201905400",
            "current_level": 16,
            "email": "mobile@gmail.com",
            "user_rank": 1,
            "next_puzzle_id": "",
            "next_puzzle_url": "",
            "next_puzzle_level": 0,
            "is_banned": false
          }
       */

    return json({
      uid: fields[0],
      username: fields[1],
      student_id: fields[2],
      current_level: Number(fields[3]),
      email: fields[4],
      user_rank: Number(fields[5]),
      next_puzzle_id: fields[6],
      next_puzzle_url: fields[7],

      next_puzzle_level: Number(fields[8]),
      is_banned: fields[9] === "t" ? true : false,
    });
  } else {
    return error(500);
  }
}
