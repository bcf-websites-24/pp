import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_object_empty, is_valid_admin } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { other_error_logger_store } from "$lib/stores.server";
import { get } from "svelte/store";

export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  let res = await run_query(
    `
    	select
          *,
          (
          select
              u1.username
          from
              public.users u1
          where
              u1.id = pa.user_id
          ),
          (
          select
              u1.student_id
          from
              public.users u1
          where
              u1.id = pa.user_id
          )
      from 
          public.puzzle_attempts pa
      order by
          pa.submitted_at desc
      limit 100;
      `,
    [],
    req
  );

  if (res) {
    if (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false) {
      get(other_error_logger_store).error(
        "\nError parsing db query result at api/admin/last_subs.\n" + res
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
          "puzzle_level": 2,
          "ip_addr": "116.204.143.171",
          "username": "truesad",
          "student_id": "190005123"
        }
      ]   
   */
    return json(res.rows);
  } else {
    return error(500);
  }
}
