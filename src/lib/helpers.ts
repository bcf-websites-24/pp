export const username_pattern = /^\w{4,32}$/;
export const student_id_pattern = /^\d{9}$/;

export class AdminPuzzleItem {
  public id: string = "";
  public loaded = false;
  public level = -1;
  public answer = "";
  public img_url = "";
  public img_data = "";
}

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

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function make_date(date: Date): string {
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hour = date.getHours();
  const ampm = hour >= 12 ? "AM" : "PM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${hour}:${minute}:${second} ${ampm} ${month} ${day}, ${year}`;
}