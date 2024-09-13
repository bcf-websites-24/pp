import { ADMIN_JWT_ID, JWT_SECRET } from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { run_query } from "./db/index.server";
// import { Env } from "@humanwhocodes/env";
// import { cleanEnv, str } from "envalid";
import { config } from "dotenv";

config();

let filesystem_error_transport;

let other_error_transport;

if (process.env.LOCAL_HOSTED_RUNTIME) {
  console.log("LOCAL runtime detected");
  filesystem_error_transport = new DailyRotateFile({
    filename: "fs_errors-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH-mm",
    zippedArchive: true,
    maxSize: "25m",
    maxFiles: "7d",
    dirname: "./logs",
  });

  other_error_transport = new DailyRotateFile({
    filename: "other_errors-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH-mm",
    zippedArchive: true,
    maxSize: "25m",
    maxFiles: "7d",
    dirname: "./logs",
  });
} else {
  console.log("SERVERLESS runtime detected");
  filesystem_error_transport = new winston.transports.Console();
  other_error_transport = new winston.transports.Console();
}

export const file_system_error_logger = winston.createLogger({
  level: "info", // lowest allowed logger level
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [filesystem_error_transport, new winston.transports.Console()],
});

export const other_error_logger = winston.createLogger({
  level: "info", // lowest allowed logger level
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [other_error_transport],
});

if (process.env.LOCAL_HOSTED_RUNTIME) {
  file_system_error_logger.transports.push(new winston.transports.Console());
  other_error_logger.transports.push(new winston.transports.Console());
}

export function make_user_cookie(cookies: Cookies, token: string): void {
  let expire_date: Date = new Date();

  expire_date.setTime(Date.now() + 86400 * 1000 * 30);
  cookies.set("pp-jwt", token, {
    path: "/",
    secure: true,
    httpOnly: true,
    expires: expire_date,
  });
}

export function make_admin_cookie(cookies: Cookies, token: string) {
  let expire_date: Date = new Date();

  expire_date.setTime(Date.now() + 86400 * 1000 * 30);
  cookies.set("pp-admin-jwt", token, {
    path: "/",
    secure: true,
    httpOnly: true,
    expires: expire_date,
  });
}

export function get_user_id(cookies: Cookies): string | null {
  const token = cookies.get("pp-jwt");

  if (token === undefined) {
    return null;
  }

  try {
    let expire_date: Date = new Date();

    expire_date.setTime(Date.now() + 86400 * 1000 * 30);

    cookies.set("pp-jwt", token, {
      path: "/",
      secure: true,
      httpOnly: true,
      expires: expire_date,
    });

    return (jwt.verify(token, JWT_SECRET) as any).id;
  } catch (err) {
    return null;
  }
}

export function is_valid_admin(cookies: Cookies): boolean {
  const token = cookies.get("pp-admin-jwt");

  if (token === undefined) {
    return false;
  }

  try {
    let expire_date: Date = new Date();

    expire_date.setTime(Date.now() + 86400 * 1000 * 30);

    cookies.set("pp-admin-jwt", token, {
      path: "/",
      secure: true,
      httpOnly: true,
      expires: expire_date,
    });

    return (jwt.verify(token, JWT_SECRET) as any).id === ADMIN_JWT_ID;
  } catch (err) {
    return false;
  }
}

export function delete_user_cookie(cookies: Cookies) {
  cookies.delete("pp-jwt", {
    path: "/",
  });
}

export function delete_admin_cookie(cookies: Cookies) {
  cookies.delete("pp-admin-jwt", {
    path: "/",
  });
}

export async function is_user_banned(user_id: string) {
  if (user_id === null) {
    return false;
  }

  let res = await run_query("SELECT public.is_user_banned($1);", [user_id]);

  if (res) {
    if (res.rows[0][0] === undefined || res.rows[0][0] === null) {
      other_error_logger.error(
        "Error parsing db function call at is_user_banned()"
      );
      return false;
    }

    return res.rows[0][0] === true;
  } else {
    return false;
  }
}
