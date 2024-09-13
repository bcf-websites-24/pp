import { error, type RequestEvent } from "@sveltejs/kit";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
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
    "SELECT public.get_submissions_puzzle($1);",
    [given_puzzle_level],
    req
  );

  if (res) {
    let t: Array<any> = [];

    res.rows.forEach((element) => {
      let r: string = element[0];
      let fields: Array<string> = r.substring(1, r.length - 1).split(",");

      if (fields.length != 8) {
        other_error_logger.error(
          "Error parsing db function result at api/admin/submissions:32"
        );
        return error(500);
      }

      fields.forEach((elem) => {
        if (elem.length == 0) {
          other_error_logger.error(
            "Error parsing db function result at api/admin/leaderboard:32"
          );
          return error(500);
        }
      });

      t.push({
        f_submitted_at: fields[0].substring(1, fields[0].length - 1),
        f_user_id: fields[1],
        f_is_correct: fields[2] === "t" ? true : false,
        f_submitted_ans: fields[3],
        f_puzzle_id: fields[4],
        f_puzzle_level: Number(fields[5]),
        f_username: fields[6],
        f_student_id: fields[7],
      });
    });

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
    return new Response(JSON.stringify(t), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return error(500);
  }
}
