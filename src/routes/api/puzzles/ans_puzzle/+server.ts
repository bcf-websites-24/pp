import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get_user_id, is_user_banned, is_user_unverified } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { other_error_logger } from "$lib/helpers.server";

/**
 * request format:
 *  {
      "puzzle_id": "6130b8f1-4415-4648-ba49-e4ec61a74c20",
      "ans": "test2"
    }
 */
export async function POST(req: RequestEvent): Promise<Response> {
  let given_user_id = get_user_id(req.cookies);
  if (given_user_id === null) {
    return error(401);
  }

  if (await is_user_banned(given_user_id)) {
    return error(403);
  }

  const request_json: any = await req.request.json();
  const given_puzzle_id: string = request_json.puzzle_id;
  let given_ans: string = request_json.ans;
  given_ans = given_ans.trim().toLowerCase();

  // this can happen if jwt token field names were changed for example, this is a server side coding error
  if (given_user_id === null || given_user_id === undefined) {
    other_error_logger.error(
      "api/puzzles/ans_puzzle:30 improper cookie decoding"
    );
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

  let res = await run_query(
    "SELECT public.add_puzzle_attempt($1, $2, $3);",
    [given_user_id, given_puzzle_id, given_ans],
    req
  );

  if (res) {
    let fields: Array<string> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length != 10) {
      other_error_logger.error(
        "Error parsing db function result at api/puzzle/ans_puzzle:59"
      );
      return error(500);
    }

    /**
       * {
            "f_is_correct": true,
            "f_next_puzzle_id": "ec652e19-c297-49e3-b156-150c446d5cdd",
            "f_next_puzzle_img_url": "2.png",
            "f_next_puzzle_level": 2,
            "f_meme_id": "e85204f6-6dcb-46d3-a59d-b9e7f12af366",
            "f_img_url": "ed785c20-b3f1-47b2-af80-532190a9aa97.png",
            "f_sound_url": "",
            "f_content": "",
            "f_is_audio": false,
            "f_rank": 1
          }
       */

    return json({
      ans: {
        f_is_correct: fields[0] === "t" ? true : false,
        f_next_puzzle_id: fields[1] !== "" ? fields[1] : null,
        f_next_puzzle_img_url: fields[2],
        f_next_puzzle_level: Number(fields[3]),
        f_meme_id: fields[4],
        f_img_url: fields[5],
        f_sound_url: fields[6],
        f_content: fields[7],
        f_is_audio: fields[8] === "t" ? true : false,
        f_rank: Number(fields[9]),
      },
    });
  } else {
    return error(500);
  }
}
