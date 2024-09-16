<script lang="ts">
  import {
    handle_unauthorized_admin,
    make_date,
    SubmissionDetails,
  } from "$lib/helpers";
  import { admin_logged_in_state, server_error_toast_store } from "$lib/stores";
  import { onMount } from "svelte";

  let submissions: Array<SubmissionDetails> = new Array<SubmissionDetails>();
  let submitting: boolean = false;
  let given_puzzle_level: number = 1;
  let puzzle_level_form_elem: HTMLFormElement;

  function submit_input(): void {
    submitting = true;
    load_submissions(given_puzzle_level);
    submitting = false;
  }

  function load_submissions(puzzle_level: number): void {
    fetch("/api/admin/submissions", {
      method: "POST",
      body: JSON.stringify({
        puzzle_level: puzzle_level,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status == 200) {
        let submission_list = await response.json();

        submissions = [];

        submission_list.forEach((element: any) => {
          let single_submission = new SubmissionDetails();

          single_submission.submission_time = make_date(
            new Date(element.f_submitted_at)
          );
          single_submission.submitted_ans = element.f_submitted_ans;
          single_submission.is_correct = element.f_is_correct;
          single_submission.username = element.f_username;
          single_submission.student_id = element.f_student_id;

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
  });
</script>

<div class="admin-page-root mx-auto mt-4 p-2">
  <form
    bind:this={puzzle_level_form_elem}
    on:submit={submit_input}
    class="card card-body shadow border-0 mb-4"
    action="javascript:"
  >
    <div class="add-puzzle-input p-1">
      <label for="answer-input" class="form-label">Puzzle Level</label>
      <input
        bind:value={given_puzzle_level}
        id="answer-input"
        type="number"
        class="form-control"
        autocomplete="off"
        required
      />
    </div>
    <div class="d-flex justify-content-end px-1">
      <button type="reset" class="btn btn-outline-danger me-2">Reset</button>
      <button type="submit" class="btn btn-primary" disabled={submitting}
        >See Submissions</button
      >
    </div>
  </form>

  <p class="fs-3 fw-semibold text-center">Submissions</p>
  <div class="card card-body table-responsive border-0 shadow-sm">
    <table class=" table">
      <thead>
        <tr>
          <th scope="col">Username</th>
          <th scope="col">Student ID</th>
          <th scope="col">Answer</th>
          <th scope="col">Status</th>
          <th scope="col">Submitted At</th>
        </tr>
      </thead>
      <tbody>
        {#each submissions as single_submission}
          <tr>
            <td>{single_submission.username}</td>
            <td>{single_submission.student_id}</td>
            <td>{single_submission.submitted_ans}</td>
            <td
              >{single_submission.is_correct === true
                ? "Correct"
                : "Incorrect"}</td
            >
            <td>{single_submission.submission_time}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
