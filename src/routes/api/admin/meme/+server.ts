import { error, json, type RequestEvent } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import {
  file_system_error_logger,
  is_valid_admin,
  other_error_logger,
} from "$lib/helpers.server";
import { run_query } from "$lib/db/index.server";
import { writeFileSync } from "fs";

/**
 * request format, formData with fields,
 *  {
        "editing" : false,
        "meme_file": file,
        "meme_id": test
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

  const meme_file: File = request_formdata.get("meme_file") as File;
  const editing: boolean = request_formdata.get("editing") === "true";
  const given_meme_id: string = request_formdata.get("meme_id") as string;
  let meme_data = {};

  if (!editing) {
    if (meme_file === undefined || meme_file === null) {
      return error(422);
    }

    let given_img_url: string = (uuidv4() +
      "." +
      meme_file.name?.split(".").pop()) as string;

    try {
      writeFileSync(
        "./bucket/Memes/" + given_img_url,
        Buffer.from(await meme_file.arrayBuffer())
      );
    } catch (err) {
      file_system_error_logger.error(
        "Error writing file to disk in api/admin/meme:60.",
        err
      );
      return error(500);
    }

    let res = await run_query(
      "SELECT public.add_new_meme($1, $2, $3, $4);",
      [given_img_url, "", "", false],
      req
    );

    if (!res) {
      return error(500);
    }

    let fields: Array<string> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length != 6) {
      other_error_logger.error(
        "Error parsing db function result in api/admin/meme:69."
      );
      return error(500);
    }

    meme_data = {
      id: fields[0],
      created_at: fields[1].substring(1, fields[1].length - 1),
      img_url: fields[2],
      sound_url: fields[3],
      is_audio: fields[4] === "t" ? true : false,
      meme_type: fields[5],
    };
  } else {
    if (given_meme_id === undefined || given_meme_id === null) {
      return error(422);
    }
    let res;

    if (meme_file === undefined || meme_file === null) {
      res = await run_query(
        "SELECT public.update_meme_nofile($1, $2, $3, $4);",
        [given_meme_id, "", false, "success"],
        req
      );

      if (!res) {
        return error(500);
      }
    } else {
      let given_img_url: string = (uuidv4() +
        "." +
        meme_file.name?.split(".").pop()) as string;

      try {
        writeFileSync(
          "./bucket/Memes/" + given_img_url,
          Buffer.from(await meme_file.arrayBuffer())
        );
      } catch (err) {
        file_system_error_logger.error(
          "Error writing file to disk in api/admin/meme:123"
        );
        return error(500);
      }

      res = await run_query(
        "SELECT public.update_meme($1, $2, $3, $4, $5, $6);",
        [given_meme_id, "", false, "success", given_img_url, ""],
        req
      );

      if (!res) {
        return error(500);
      }
    }

    let fields: Array<string> = res.rows[0][0]
      .substring(1, res.rows[0][0].length - 1)
      .split(",");

    if (fields.length != 7) {
      other_error_logger.error(
        "Error parsing db function result in api/admin/meme:139"
      );
      return error(500);
    }

    meme_data = {
      id: fields[0],
      created_at: fields[1].substring(1, fields[1].length - 1),
      img_url: fields[2],
      sound_url: fields[3],
      content: fields[4],
      is_audio: fields[5] === "t" ? true : false,
      meme_type: fields[6],
    };
  }

  return json(meme_data);
}
