import { supabase_client_store } from "$lib/stores.server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { delete_jwt_cookie, make_jwt_cookie } from "$lib/helpers.server";
import { JWT_SECRET } from "$env/static/private";

export async function POST(request_event: RequestEvent): Promise<Response> {
  const request: Request = request_event.request;
  const request_json: any = await request.json();
  const username: string = request_json.username;
  const password: string = request_json.password;
  const uuid_hash_rpc: PostgrestSingleResponse<any> = await get(supabase_client_store).rpc("get_uuid_hash",
    {
      given_username: username
    }
  );

  if (uuid_hash_rpc.error) {
    console.error("users/login line 24\n" + uuid_hash_rpc.error);

    return error(500);
  }

  const id: string | null = uuid_hash_rpc.data[0].id;
  const hash: string = uuid_hash_rpc.data[0].hash;

  if (id === null) {
    return json(
      {
        login: -1 // user not found
      }
    );
  }

  if (!await argon2.verify(hash, password)) {
    return json(
      {
        login: -2 // password mismatch
      }
    );
  }

  const token: string = jwt.sign(
    {
      id: id
    }, JWT_SECRET
  );

  make_jwt_cookie(request_event.cookies, token);

  return json(
    {
      login: 0    // success
    }
  );
}