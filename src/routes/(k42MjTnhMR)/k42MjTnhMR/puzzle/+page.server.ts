import { run_query } from "$lib/db/index.server";
import { is_valid_admin, other_error_logger } from "$lib/helpers.server";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(load_event: ServerLoadEvent): Promise<any> {
  if (!is_valid_admin(load_event.cookies)) {
    return error(401);
  }

  let res = await run_query("SELECT public.get_all_puzzles();", []);

  if (res) {
    let t: Array<any> = [];

    res.rows.forEach((element) => {
      let r: string = element[0];
      let fields: Array<string> = r.substring(1, r.length - 1).split(",");

      if (fields.length != 8) {
        other_error_logger.error(
          "Error parsing db function result at routes/(admin)/admin/puzzle:24"
        );
        return error(500);
      }

      t.push({
        f_id: fields[0],
        f_created_at: fields[1].substring(1, fields[1].length - 1),
        f_img_url: fields[2],
        f_ans: fields[3],
        f_puzzle_level: Number(fields[4]),
        f_title: fields[5],
        f_info: fields[6],
        f_info_link: fields[7],
      });
    });

    return {
      puzzles: t,
    };
  } else {
    return error(500);
  }
}
