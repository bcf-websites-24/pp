import { ADMIN_JWT_ID, JWT_SECRET } from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

export function make_user_cookie(cookies: Cookies, token: string): void {
  let expire_date: Date = new Date();

  expire_date.setTime(Date.now() + 86400 * 1000 * 30);
  cookies.set("pp-jwt", token,
    {
      path: "/",
      secure: true,
      httpOnly: true,
      expires: expire_date
    }
  );
}

export function make_admin_cookie(cookies: Cookies, token: string) {
  let expire_date: Date = new Date();

  expire_date.setTime(Date.now() + 86400 * 1000 * 30);
  cookies.set("pp-admin-jwt", token,
    {
      path: "/",
      secure: true,
      httpOnly: true,
      expires: expire_date
    }
  );
}

export function get_user_id(cookies: Cookies): string | null {
  const token = cookies.get("pp-jwt");

  if (token === undefined) {
    return null;
  }

  try {
    let expire_date: Date = new Date();

    expire_date.setTime(Date.now() + 86400 * 1000 * 30);

    cookies.set("pp-jwt", token,
      {
        path: "/",
        secure: true,
        httpOnly: true,
        expires: expire_date
      }
    );

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

    cookies.set("pp-admin-jwt", token,
      {
        path: "/",
        secure: true,
        httpOnly: true,
        expires: expire_date
      }
    );

    return (jwt.verify(token, JWT_SECRET) as any).id === ADMIN_JWT_ID;
  } catch (err) {
    return false;
  }
}

export function delete_user_cookie(cookies: Cookies) {
  cookies.delete("pp-jwt",
    {
      path: "/"
    }
  );
}

export function delete_admin_cookie(cookies: Cookies) {
  cookies.delete("pp-admin-jwt",
    {
      path: "/"
    }
  );
}