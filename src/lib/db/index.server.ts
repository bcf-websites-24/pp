import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { type RequestEvent } from "@sveltejs/kit";
import { pg_pool_store, db_error_logger_store } from "$lib/stores.server";
import type { QueryResult } from "pg";
import { get } from "svelte/store";
// import { config } from "dotenv";

// config();

// let transport;

// if (!process.env.LOCAL_HOSTED_RUNTIME) {
//   transport = new winston.transports.Console();
// } else {
//   transport = new DailyRotateFile({
//     filename: "db_errors-%DATE%.json",
//     datePattern: "YYYY-MM-DD-HH-mm",
//     zippedArchive: true,
//     maxSize: "25m",
//     maxFiles: "7d",
//     dirname: "./logs",
//   });
// }

// const db_error_logger = winston.createLogger({
//   level: "info", // lowest allowed logger level
//   format: winston.format.combine(
//     winston.format.errors({ stack: true }),
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [transport],
// });

// if (process.env.LOCAL_HOSTED_RUNTIME) {
//   db_error_logger.transports.push(new winston.transports.Console());
// }

export async function run_query(
  text: string,
  params: Array<any>,
  req?: RequestEvent
) {
  let res: QueryResult<any>;

  try {
    res = await get(pg_pool_store).query(text, params);
  } catch (error) {
    get(db_error_logger_store).error(
      "Req ip: " +
        req?.getClientAddress() +
        ", Req query: " +
        text +
        ", Req params: " +
        params +
        ". ERROR: ",
      error
    );
    return null;
  }
  return res;
}
