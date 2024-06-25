import { error, json, type RequestEvent } from "@sveltejs/kit";
import { type PostgrestSingleResponse } from "@supabase/supabase-js";
import argon2 from "argon2";
import { supabase_client_store } from "$lib/stores.server";
import { get } from "svelte/store";
import { make_jwt_cookie } from "$lib/helpers.server";
import jwt from "jsonwebtoken";
import { PUBLIC_JWT_SECRET } from "$env/static/public";

export async function POST(request_event: RequestEvent): Promise<Response>
{
    const request: Request = request_event.request;
    const request_json: any = await request.json();
    const username: string = request_json.username;
    const student_id: string = request_json.student_id;
    const email: string = request_json.email;
    const password: string = request_json.password;
    const password_hash: string = await argon2.hash(password);
    const add_user_rpc: PostgrestSingleResponse<any> = await get(supabase_client_store).rpc('add_user',
        {
            given_email: email,
            given_pwd_hash: password_hash,
            given_student_id: student_id,
            given_username: username
        }
    );

    if(add_user_rpc.error)
    {
        console.error(add_user_rpc.error);

        return error(500);
    }

    console.log(add_user_rpc.data);

    if(add_user_rpc.data !== null)
    {
        const token: string = jwt.sign(
            {
                uid: add_user_rpc.data,
            }, PUBLIC_JWT_SECRET
        );
        make_jwt_cookie(request_event.cookies, token);

        return json(
            {
                registered: 0
            }
        );
    }
    else
    {
        request_event.cookies.delete("pp-jwt",
            {
                path: "/"
            });

        return json(
            {
                registered: -1
            }
        );
    }
}