import { run_query } from "$lib/db/index.server";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  let res = await run_query("SELECT public.get_all_memes();", []);

  if (res) {
    let t: Array<any> = [];

    res.rows.forEach((element) => {
      let r: string = element[0];
      let fields: Array<string> = r.substring(1, r.length - 1).split(",");

      if (fields.length != 7) {
        other_error_logger.error(
          "Error parsing db function result at routes/(admin)/admin/meme/server.ts:24"
        );
        return error(500);
      }

      t.push({
        f_created_at: fields[0].substring(1, fields[0].length - 1),
        f_img_url: fields[1],
        f_sound_url: fields[2],
        f_content: fields[3],
        f_is_audio: fields[4] === "t" ? true : false,
        f_id: fields[5],
        f_meme_type: fields[6],
      });
    });

    return {
      memes: t,
    };
  } else {
    return error(500);
  }
}
