import { error, json, type RequestEvent } from "@sveltejs/kit";
import { is_object_empty, is_valid_admin } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { get } from "svelte/store";
import { other_error_logger_store, s3_store } from "$lib/stores.server";
import { STORAGE_BUCKET_NAME } from "$env/static/private";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * @example request: {puzzle_id : 'b62fec79-f6f8-41f1-a282-c2ae1c42690b'}, succesful deletion response: {success: 1}. Failed deletion response: {success: 0}
 */
export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  const request_json: any = await req.request.json();
  const puzzle_id: string = request_json.puzzle_id;

  if (puzzle_id === undefined || puzzle_id === null) {
    return error(422);
  }
  console.log("starting deletion of puzzle");
  let res = await run_query(
    "SELECT * from public.delete_puzzle($1) as (success integer);",
    [puzzle_id],
    req
  );
  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at api/admin/puzzles/rm:31.\n" + res
      );
      return error(500);
    }
    console.log("Deleted puzzle, now deleleting file");
    let img_url_query = await run_query(
      "select p.img_url from public.puzzles p where p.id = $1;",
      [puzzle_id]
    );

    if (img_url_query && img_url_query.rows[0]) {
      try {
        await get(s3_store).send(
          new DeleteObjectCommand({
            Bucket: STORAGE_BUCKET_NAME,
            Key: `puzzle/${img_url_query.rows[0]}`,
          })
        );
      } catch (err) {
        get(other_error_logger_store).error(
          "Failure deleting puzzle file for deleted puzzle",
          err
        );
      }
    }
    console.log("successfully deleted file");
    return json({
      success: res.rows[0].success,
    });
  } else {
    return error(500);
  }
}
