import type { Cookies } from "@sveltejs/kit";

export function make_user_cookie(cookies: Cookies, token: string) {
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