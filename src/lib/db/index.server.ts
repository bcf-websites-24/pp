import { DB_CONN_STRING } from "$env/static/private";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { type RequestEvent } from "@sveltejs/kit";
import pg from "pg";

const pool = new pg.Pool({ connectionString: DB_CONN_STRING });

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
  let query_config: pg.QueryArrayConfig<any> = {
    text: text,
    values: params,
    rowMode: "array",
  };
  let res: pg.QueryResult<any>;

  try {
    res = await pool.query(query_config);
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
