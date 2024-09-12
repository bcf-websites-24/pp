import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { type RequestEvent } from "@sveltejs/kit";
import { pg_pool_store } from "$lib/stores.server";
import type { QueryArrayConfig, QueryResult } from "pg";
import { get } from "svelte/store";

const transport: DailyRotateFile = new DailyRotateFile({
  filename: "db_errors-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH-mm",
  zippedArchive: true,
  maxSize: "25m",
  maxFiles: "7d",
  dirname: "./logs",
});

const db_error_logger = winston.createLogger({
  level: "info", // lowest allowed logger level
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [transport],
});

export async function run_query(
  text: string,
  params: Array<any>,
  req?: RequestEvent
) {
  let query_config: QueryArrayConfig<any> = {
    text: text,
    values: params,
    rowMode: "array",
  };
  let res: QueryResult<any>;

  try {
    res = await get(pg_pool_store).query(query_config);
  } catch (error) {
    db_error_logger.error(
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
