import { readable, type Readable } from "svelte/store";
import supabase, {type SupabaseClient} from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";

export const supabase_client_store: Readable<SupabaseClient<any, "public", any>> = readable(supabase.createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY));