import { ADMIN_JWT_ID, JWT_SECRET } from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { run_query } from "./db/index.server";

import { other_error_logger_store } from "./stores.server";
import { get } from "svelte/store";

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

export function make_otp_cookie(cookies: Cookies, token: string, expire: Date): void {
  cookies.set("pp-otp-jwt", token, {
    path: "/",
    secure: true,
    httpOnly: true,
    expires: expire
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
    return "";
  }

  try {
    let expire_date: Date = new Date();

    expire_date.setTime(Date.now() + 86400 * 1000 * 30);

    cookies.set("pp-jwt", token, {
      path: "/",
      secure: false,
      httpOnly: true,
      expires: expire_date,
    });

    return (jwt.verify(token, JWT_SECRET) as any).id;
  } catch (err) {
    return null;
  }
}

export function get_otp_id(cookies: Cookies): string | null {
  const token = cookies.get("pp-otp-jwt");

  if (token === undefined) {
    return null;
  }

  try {
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
      secure: false,
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

export function delete_otp_cookie(cookies: Cookies) {
  cookies.delete("pp-otp-jwt", {
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

  let res = await run_query(
    "SELECT * from public.is_user_banned($1) as (is_user_banned boolean);",
    [user_id]
  );

  if (res) {
    if (
      res.rowCount === 0 ||
      (res.rowCount !== 0 && is_object_empty(res.rows[0]) !== false)
    ) {
      get(other_error_logger_store).error(
        "\nError parsing db function result at is_user_banned() with user id: " +
        user_id +
        ".\n" +
        res
      );
      return false;
    }

    return res.rows[0].is_user_banned;
  } else {
    return false;
  }
}

export function is_object_empty(obj: any) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
