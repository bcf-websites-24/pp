import ca_cert from "$lib/certificates/ca-certificate.crt?raw";
import {
  DB_CONN_STRING,
  STORAGE_ACCESS_KEY,
  STORAGE_ENDPOINT,
  STORAGE_SECRET,
} from "$env/static/private";
import { readable } from "svelte/store";
import pg from "pg";
import { S3 } from "@aws-sdk/client-s3";
import * as winston from "winston";
import { config } from "dotenv";
import DailyRotateFile from "winston-daily-rotate-file";

config();

let other_error_transports: Array<any> = [new winston.transports.Console()];
let db_error_transports: Array<any> = [new winston.transports.Console()];

if (process.env.LOCAL_HOSTED_RUNTIME) {
  other_error_transports.push(
    new DailyRotateFile({
      filename: "other_errors-%DATE%.json",
      datePattern: "YYYY-MM-DD-HH-mm",
      zippedArchive: true,
      maxSize: "25m",
      maxFiles: "7d",
      dirname: "./logs",
    })
  );

  db_error_transports.push(
    new DailyRotateFile({
      filename: "db_errors-%DATE%.json",
      datePattern: "YYYY-MM-DD-HH-mm",
      zippedArchive: true,
      maxSize: "25m",
      maxFiles: "7d",
      dirname: "./logs",
    })
  );
}

let other_error_logger = new winston.Logger({
  level: "info", // lowest allowed logger level
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: other_error_transports,
});

let db_error_logger = new winston.Logger({
  level: "info", // lowest allowed logger level
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: db_error_transports,
});

export const other_error_logger_store = readable(other_error_logger, (set) => {
  return () => {};
});

export const db_error_logger_store = readable(db_error_logger, (set) => {
  return () => {};
});

export const pg_pool_store = readable(
  new pg.Pool({
    connectionString: DB_CONN_STRING,
    ssl: {
      rejectUnauthorized: true,
      ca: ca_cert,
    },
  })
);

export const s3_store = readable(
  new S3({
    endpoint: STORAGE_ENDPOINT,
    region: "sgp1",
    credentials: {
      accessKeyId: STORAGE_ACCESS_KEY,
      secretAccessKey: STORAGE_SECRET,
    },
  })
);
