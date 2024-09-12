import { Toast } from "bootstrap";
import { writable } from "svelte/store";

export const admin_logged_in_state = writable(false);
export const user_logged_in_state = writable(false);
export const username_state = writable("");
export const current_level_state = writable(-1);
export const current_rank_state = writable(-1);
export const next_level_id_state = writable<number | null>(null);
export const next_level_url_state = writable("");
export const correct_answer_toast_store = writable(new Toast(""));
export const wrong_answer_toast_store = writable(new Toast(""));
export const success_toast_store = writable(new Toast(""));
export const fail_toast_store = writable(new Toast(""));
export const server_error_toast_store = writable(new Toast(""));
export const unauthorized_toast_store = writable(new Toast(""));
export const user_not_found_toast_store = writable(new Toast(""));
export const password_unmatched_toast_store = writable(new Toast(""));
export const banned_toast_store = writable(new Toast(""));
export const student_id_misformation_toast_store = writable(new Toast(""));
export const roll_out_of_range_toast_store = writable(new Toast(""));
export const improper_username_toast_store = writable(new Toast(""));
export const invalid_email_toast_store = writable(new Toast(""));
export const duplicate_username_student_id_toast_store = writable(
  new Toast("")
);
