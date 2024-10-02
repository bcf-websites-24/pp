<script lang="ts">
  import {
    handle_unauthorized_admin,
    make_date,
    SubmissionDetails,
  } from "$lib/helpers";
  import { admin_logged_in_state, server_error_toast_store } from "$lib/stores";
  import { onMount } from "svelte";

  let submissions: Array<SubmissionDetails> = new Array<SubmissionDetails>();

  function load_submissions(): void {
    fetch("/api/admin/last_subs", {
      method: "POST",
      body: JSON.stringify({
        username: "",
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status == 200) {
        let submission_list = await response.json();

        submissions = [];

        submission_list.forEach((element: any) => {
          let single_submission = new SubmissionDetails();

          single_submission.submission_time = make_date(
            new Date(element.submitted_at)
          );
          single_submission.submitted_ans = element.submitted_ans;
          single_submission.is_correct = element.is_correct;
          single_submission.username = element.username;
          single_submission.student_id = element.student_id;
          single_submission.puzzle_level = element.puzzle_level;
          single_submission.ip_addr = element.ip_addr;

          submissions.push(single_submission);
        });
      } else if (response.status === 401) {
        handle_unauthorized_admin();
      } else if (response.status === 500) {
        $server_error_toast_store.show();
      }
    });
  }

  onMount((): void => {
    $admin_logged_in_state = true;
    load_submissions();
  });
</script>

<div class="admin-page-root mx-auto mt-4 p-2">
  <p class="fs-3 fw-semibold text-center">Last 100 Submissions</p>
  <div class="card card-body table-responsive border-0 shadow-sm">
    <table class=" table" style="table-layout:fixed">
      <thead>
        <tr>
          <th scope="col">Puzzle Level</th>
          <th scope="col">Username</th>
          <th scope="col">ID</th>
          <th scope="col">Answer</th>
          <th scope="col">Status</th>
          <th scope="col">Submitted At</th>
          <th scope="col">IP</th>
        </tr>
      </thead>
      <tbody>
        {#each submissions as single_submission}
          <tr>
            <td
              style={single_submission.is_correct
                ? `background-color:#90EE90;color:black !important`
                : ``}>{single_submission.puzzle_level}</td
            >
            <td
              style={single_submission.is_correct
                ? `background-color:#90EE90;color:black !important`
                : ``}>{single_submission.username}</td
            >
            <td
              style={single_submission.is_correct
                ? `background-color:#90EE90;color:black !important`
                : ``}>{single_submission.student_id}</td
            >
            <td
              style={`word-wrap:break-word;${single_submission.is_correct ? "background-color:#90EE90;color:black" : ""} !important`}
              >{single_submission.submitted_ans}</td
            >
            <td
              style={single_submission.is_correct
                ? `background-color:#90EE90;color:black !important`
                : ``}
              >{single_submission.is_correct === true
                ? "Correct"
                : "Incorrect"}</td
            >
            <td
              style={single_submission.is_correct
                ? `background-color:#90EE90;color:black !important`
                : ``}>{single_submission.submission_time}</td
            >
            <td
              style={single_submission.is_correct
                ? `background-color:#90EE90;color:black !important`
                : ``}>{single_submission.ip_addr}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
