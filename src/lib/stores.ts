import { Toast } from "bootstrap";
import { writable } from "svelte/store";

export const admin_logged_in_state = writable(true);
export const user_logged_in_state = writable(false);
export const username_state = writable("");
export const current_level_state = writable(-1);
export const current_rank_state = writable(-1);
export const next_level_id_state = writable(-1);
export const next_level_url_state = writable("");
export const wrong_answer_toast_store = writable(new Toast(""));