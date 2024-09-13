import { error, json, type RequestEvent } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { get } from "svelte/store";
import { s3_store } from "$lib/stores.server";
import { STORAGE_BUCKET_NAME } from "$env/static/private";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";

/**
 * request format, formData with fields,
 *  {
        "hashed_ans": "test_api",
        "info_link": "test.com",
        "puzzle_level": 9,
        "editing" : false,
        "puzzle_file": file,
        "puzzle_id": test
    }
 */
export async function POST(req: RequestEvent): Promise<Response> {
  if (!is_valid_admin(req.cookies)) {
    return error(401);
  }

  const request_formdata: any = await req.request.formData();

  if (request_formdata === undefined) {
    return error(422);
  }

  const given_hashed_ans: string = request_formdata.get("hashed_ans") as string;
  const given_info: string = request_formdata.get("info_link") as string;
  const given_info_link: string = "";
  const given_puzzle_level: number = Number(
    request_formdata.get("puzzle_level")
  );

  const given_title: string = "";
  const puzzle_file: File = request_formdata.get("puzzle_file") as File;
  const editing: boolean = request_formdata.get("editing") === "true";
  const given_puzzle_id: string = request_formdata.get("puzzle_id") as string;

  // client side did not give correct request fields
  let inputs: Array<any> = [
    given_hashed_ans,
    given_info,
    given_info_link,
    given_puzzle_level,
    given_title,
    editing,
  ];

  inputs.forEach((element) => {
    if (element === undefined || element === null) {
      return error(422);
    }
  });

  let puzzle_data;
  let res;

  if (!editing) {
    if (puzzle_file === undefined || puzzle_file === null) {
      return error(422);
    }

    let given_img_url: string = `${uuidv4()}.${puzzle_file.name
      ?.split(".")
      .pop()}`;

    try {
      await get(s3_store).send(
        new PutObjectCommand({
          Bucket: STORAGE_BUCKET_NAME,
          Key: `puzzle/${given_img_url}`,
          Body: new Uint8Array(await puzzle_file.arrayBuffer()),
          ACL: "public-read",
          ContentType: mime.lookup(given_img_url).toString(),
        })
      );
    } catch (err) {
      console.log(err);

      return error(500);
    }

    res = await run_query(
      "SELECT public.add_new_puzzle($1, $2, $3, $4, $5, $6);",
      [
        given_img_url,
        given_hashed_ans,
        given_puzzle_level,
        given_title,
        given_info,
        given_info_link,
      ],
      req
    );

    if (!res) {
      return error(500);
    }
  } else {
    if (given_puzzle_id === undefined || given_puzzle_id === null) {
      return error(422);
    }

    if (puzzle_file === undefined || puzzle_file === null) {
      res = await run_query(
        "SELECT public.update_puzzle_nofile($1, $2, $3, $4, $5, $6);",
        [
          given_puzzle_id,
          given_hashed_ans,
          given_puzzle_level,
          given_title,
          given_info,
          given_info_link,
        ],
        req
      );

      if (!res) {
        return error(500);
      }
    } else {
      let given_img_url: string = `${uuidv4()}.${puzzle_file.name
        ?.split(".")
        .pop()}`;

      try {
        await get(s3_store).send(
          new PutObjectCommand({
            Bucket: STORAGE_BUCKET_NAME,
            Key: `puzzle/${given_img_url}`,
            Body: new Uint8Array(await puzzle_file.arrayBuffer()),
            ACL: "public-read",
            ContentType: mime.lookup(given_img_url).toString(),
          })
        );
      } catch (err) {
        console.log(err);

        return error(500);
      }

      res = await run_query(
        "SELECT public.update_puzzle($1, $2, $3, $4, $5, $6, $7);",
        [
          given_puzzle_id,
          given_img_url,
          given_hashed_ans,
          given_puzzle_level,
          given_title,
          given_info,
          given_info_link,
        ],
        req
      );

      if (!res) {
        return error(500);
      }
    }
  }

  let fields: Array<string> = res?.rows[0][0]
    .substring(1, res?.rows[0][0].length - 1)
    .split(",");

  if (fields.length != 8) {
    other_error_logger.error(
      "Error parsing db function result in api/admin/puzzle:169."
    );
    return error(500);
  }

  puzzle_data = {
    id: fields[0],
    created_at: fields[1].substring(1, fields[1].length - 1),
    img_url: fields[2],
    ans: fields[3],
    puzzle_level: Number(fields[4]),
    title: fields[5],
    info: fields[6],
    info_link: fields[7],
  };
  return json(puzzle_data);
}
