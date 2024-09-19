import { error, json, type RequestEvent } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { is_object_empty, is_valid_admin } from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { get } from "svelte/store";
import { other_error_logger_store, s3_store } from "$lib/stores.server";
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

  if (Number.isNaN(given_puzzle_level)) {
    return error(422);
  }

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
      `select
        *
      from
        public.add_new_puzzle(
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        ) as (
          id uuid,
          created_at timestamptz,
          img_url text,
          ans text,
          puzzle_level bigint,
          title text,
          info text ,
          info_link text
        );`,
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
        `select
          *
        from
          public.update_puzzle_nofile(
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          ) as (
            id uuid,
            created_at timestamptz,
            img_url text,
            ans text,
            puzzle_level bigint,
            title text,
            info text ,
            info_link text
          );`,
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
        `select
          *
        from
          public.update_puzzle(
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          ) as (
            id uuid,
            created_at timestamptz,
            img_url text,
            ans text,
            puzzle_level bigint,
            title text,
            info text ,
            info_link text
          );`,
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

  if (
    res.rowCount === 0 ||
    (res.rowCount !== 0 && is_object_empty(res.rows[0]))
  ) {
    get(other_error_logger_store).error(
      "\nError parsing db function result in api/admin/puzzle:239.\n" + res
    );
    return error(500);
  }

  return json(res.rows[0]);
}
