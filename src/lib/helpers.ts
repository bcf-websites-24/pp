import { get } from "svelte/store";
import {
  banned_toast_store,
  server_error_toast_store,
  unauthorized_toast_store,
  unverified_toast_store,
} from "./stores";
import { goto } from "$app/navigation";

export const username_pattern = /^\w{4,32}$/;
export const student_id_pattern = /^\d{7}$/;

export type AdminPuzzleItem = {
  id: string;
  loaded: boolean;
  level: number;
  answer: string;
  img_url: string;
  img_data?: string;
};

export class AdminMemeItem {
  public id: string = "";
  public loaded = false;
  public img_url = "";
  public img_data = "";
}

export class AdminUserDetails {
  public username = "";
  public student_id = "";
  public email = "";
  public shomobay_score = -1;
}

export class AdminUserItem {
  public details = new AdminUserDetails();
  public level = -1;
  public attemps = -1;
  public last_submission = "";
}

export class SubmissionDetails {
  public submission_time = "";
  public submitted_ans = "";
  public is_correct = true;
  public username = "";
  public student_id = "";
  public puzzle_level = 0;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function make_date(date: Date): string {
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hour = date.getHours();
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:${second
    .toString()
    .padStart(2, "0")} ${ampm} ${month} ${day
    .toString()
    .padStart(2, "0")}, ${year}`;
}

export function handle_unauthorized_user(): void {
  get(unauthorized_toast_store).show();
  goto("/", { invalidateAll: true });
}

export function handle_unverified_user(): void {
  get(unverified_toast_store).show();
  goto("/", { invalidateAll: true });
}

export function logout_user(banned: boolean): void {
  fetch("/api/users/logout").then((response) => {
    if (response.status === 200) {
      if (banned) {
        get(banned_toast_store).show();
      }

      goto("/", { invalidateAll: true });
    } else if (response.status === 401) {
      handle_unauthorized_user();
    } else if (response.status === 500) {
      get(server_error_toast_store).show();
    }
  });
}

export function handle_unauthorized_admin(): void {
  get(unauthorized_toast_store).show();
  goto("/k42MjTnhMR", { invalidateAll: true });
}
