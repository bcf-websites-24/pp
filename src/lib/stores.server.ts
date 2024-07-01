import { readable, type Readable } from "svelte/store";
import supabase, {type SupabaseClient} from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "$env/static/private";

export const supabase_client_store: Readable<SupabaseClient<any, "public", any>> = readable(supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));