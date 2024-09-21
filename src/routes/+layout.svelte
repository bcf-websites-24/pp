<script lang="ts">
  import "$lib/style.scss";
  import {
    correct_answer_toast_store,
    fail_toast_store,
    password_unmatched_toast_store,
    success_toast_store,
    unauthorized_toast_store,
    banned_toast_store,
    user_not_found_toast_store,
    wrong_answer_toast_store,
    student_id_misformation_toast_store,
    roll_out_of_range_toast_store,
    improper_username_toast_store,
    invalid_email_toast_store,
    duplicate_username_student_id_toast_store,
    mail_verification_failed_store,
    duplicate_puzzle_level_store,
  } from "$lib/stores";
  import { Toast } from "bootstrap";
  import { onMount } from "svelte";
  import Loader from "$lib/components/loader.svelte";

  /**
   * ensures that all
   * toasts are loaded
   * before being used by
   * any other children
   */
  let mounted = false;
  let correct_answer_toast_elem: HTMLDivElement;
  let wrong_answer_toast_elem: HTMLDivElement;
  let success_toast_elem: HTMLDivElement;
  let fail_toast_elem: HTMLDivElement;
  let unauthorized_toast_elem: HTMLDivElement;
  let user_unavailable_toast_elem: HTMLDivElement;
  let password_unmatched_toast_elem: HTMLDivElement;
  let banned_toast_elem: HTMLDivElement;
  let student_id_misformation_toast_elem: HTMLDivElement;
  let roll_out_of_range_toast_elem: HTMLDivElement;
  let improper_username_toast_elem: HTMLDivElement;
  let invalid_email_toast_elem: HTMLDivElement;
  let duplicate_username_student_id_toast_elem: HTMLDivElement;
  let mail_verification_failed_elem: HTMLDivElement;
  let duplicate_puzzle_level_elem: HTMLDivElement;

  onMount((): void => {
    $correct_answer_toast_store = new Toast(correct_answer_toast_elem);
    $wrong_answer_toast_store = new Toast(wrong_answer_toast_elem);
    $success_toast_store = new Toast(success_toast_elem);
    $fail_toast_store = new Toast(fail_toast_elem);
    $unauthorized_toast_store = new Toast(unauthorized_toast_elem);
    $user_not_found_toast_store = new Toast(user_unavailable_toast_elem);
    $password_unmatched_toast_store = new Toast(password_unmatched_toast_elem);
    $banned_toast_store = new Toast(banned_toast_elem);
    $student_id_misformation_toast_store = new Toast(
      student_id_misformation_toast_elem
    );
    $roll_out_of_range_toast_store = new Toast(roll_out_of_range_toast_elem);
    $improper_username_toast_store = new Toast(improper_username_toast_elem);
    $invalid_email_toast_store = new Toast(invalid_email_toast_elem);
    $duplicate_username_student_id_toast_store = new Toast(
      duplicate_username_student_id_toast_elem
    );
    $mail_verification_failed_store = new Toast(mail_verification_failed_elem);
    $duplicate_puzzle_level_store = new Toast(duplicate_puzzle_level_elem);

    mounted = true;
  });
</script>

<svelte:head>
  <title>Picture Puzzle 2024</title>
</svelte:head>

<Loader />

{#if mounted}
  <slot></slot>
{/if}

<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div
    bind:this={correct_answer_toast_elem}
    class="toast align-items-center text-bg-success border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Correct answer!</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={wrong_answer_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Oops! Wrong answer</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={success_toast_elem}
    class="toast align-items-center text-bg-success border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Success</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={fail_toast_elem}
    class="toast align-items-center text-bg-success border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Failed</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={unauthorized_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Unauthorized</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={user_unavailable_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">User not found</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={password_unmatched_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Password didn't match</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={banned_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">User banned</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={student_id_misformation_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Student ID is of improper format.</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={roll_out_of_range_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Student roll is out of valid range.</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={improper_username_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">
        Username must be alphanumeric with no spaces.
      </div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={invalid_email_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Invalid Email address given.</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={duplicate_username_student_id_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Username or student id already in use.</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={mail_verification_failed_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">
        Failed to send verification mail, please check your mail address.
      </div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={duplicate_puzzle_level_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">
        Puzzle with same level already exists, please check your inputs.
      </div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
</div>
