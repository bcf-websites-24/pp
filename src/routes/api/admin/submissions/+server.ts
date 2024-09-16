import { error, json, type RequestEvent } from "@sveltejs/kit";
import {
  is_object_empty,
  is_valid_admin,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  const request_json: any = await req.request.json();
  const given_puzzle_level: number = Number(request_json.puzzle_level);

  if (
    given_puzzle_level === undefined ||
    given_puzzle_level === null ||
    Number.isNaN(given_puzzle_level)
  ) {
    return error(422);
  }

  let res = await run_query(
    "SELECT * from public.get_submissions_puzzle($1);",
    [given_puzzle_level],
    req
  );

  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      other_error_logger.error(
        "\nError parsing db function result at api/admin/submissions:30.\n" +
          res
      );
      return error(500);
    }

    // submissions in descending submission time order. Array of objects. format:
    /**
   *  [
        {
          "f_submitted_at": "2024-09-13 08:03:31.419181+00",
          "f_user_id": "8b00ed84-a009-4395-94cc-52fa10a52867",
          "f_is_correct": true,
          "f_submitted_ans": "2",
          "f_puzzle_id": "3f9987ae-c640-4a34-8da7-44f8eecd7094",
          "f_puzzle_level": 2,
          "f_username": "truesad",
          "f_student_id": "190005123"
        }
      ]   
   */
    return json(res.rows);
  } else {
    return error(500);
  }
}
