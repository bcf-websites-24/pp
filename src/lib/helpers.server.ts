import type { Cookies } from "@sveltejs/kit";

export function make_jwt_cookie(cookies: Cookies, token: string)
{
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