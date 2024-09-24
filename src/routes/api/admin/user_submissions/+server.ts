import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_object_empty, is_valid_admin } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { other_error_logger_store } from "$lib/stores.server";
import { get } from "svelte/store";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  const request_json: any = await req.request.json();
  const given_username: string = request_json.username;

  if (given_username === undefined || given_username === null) {
    return error(422);
  }

  let res = await run_query(
    `
    select
      *
    from
      public.puzzle_attempts pa
    where
      pa.user_id = (
        select
          u.id
        from
          public.users u
        where
          u.username = $1
        limit 1
      )
    order by
      pa.submitted_at desc;
    `,
    [given_username],
    req
  );

  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      get(other_error_logger_store).error(
        "\nError parsing db query result at api/admin/user_submissions.\n" + res
      );
      return error(500);
    }

    // submissions in descending submission time order. Array of objects. format:
    /**
   *  [
        {
          "submitted_at": "2024-09-13 08:03:31.419181+00",
          "user_id": "8b00ed84-a009-4395-94cc-52fa10a52867",
          "is_correct": true,
          "submitted_ans": "2",
          "puzzle_id": "3f9987ae-c640-4a34-8da7-44f8eecd7094",
          "puzzle_level": 2
        }
      ]   
   */
    return json(res.rows);
  } else {
    return error(500);
  }
}
