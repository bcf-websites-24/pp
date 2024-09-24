<script lang="ts">
  import "$lib/styles/global.scss";
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
    duplicate_puzzle_level_store,
    asked_too_many_otp_toast_store,
    otp_mismatch_toast_store,
    Invalid_otp_user_toast_store,
    otp_time_limit_over_toast_store,
    otp_user_id_mail_exists_toast_store,
    otp_user_nonexistent_toast_store,
    otp_user_already_verified_toast_store,
    otp_username_exists_toast_store,
    otp_student_id_exists_toast_store,
    otp_mail_exists_toast_store,
    otp_sent_toast_store,
    email_not_found_toast_store,
    email_send_failed_toast_store,
  } from "$lib/stores";
  import { Toast } from "bootstrap";
  import { onMount } from "svelte";
  import Loader from "$lib/components/loader.svelte";

  const toast_delay = 1000; // milliseconds
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
  let duplicate_puzzle_level_elem: HTMLDivElement;
  let asked_too_many_otp_toast_elem: HTMLDivElement;
  let otp_mismatch_toast_elem: HTMLDivElement;
  let Invalid_otp_user_toast_elem: HTMLDivElement;
  let otp_time_limit_over_toast_elem: HTMLDivElement;
  let otp_user_id_mail_exists_toast_elem: HTMLDivElement;
  let otp_user_nonexistent_toast_elem: HTMLDivElement;
  let otp_user_already_verified_toast_elem: HTMLDivElement;
  let otp_username_exists_toast_elem: HTMLDivElement;
  let otp_student_id_exists_toast_elem: HTMLDivElement;
  let otp_mail_exists_toast_elem: HTMLDivElement;
  let otp_sent_toast_elem: HTMLDivElement;
  let email_not_found_toast_elem: HTMLDivElement;
  let email_send_failed_toast_elem: HTMLDivElement;

  function create_toast(elem: HTMLElement) {
    return new Toast(elem, {
      delay: toast_delay,
    });
  }

  onMount((): void => {
    $correct_answer_toast_store = create_toast(correct_answer_toast_elem);
    $wrong_answer_toast_store = create_toast(wrong_answer_toast_elem);
    $success_toast_store = create_toast(success_toast_elem);
    $fail_toast_store = create_toast(fail_toast_elem);
    $unauthorized_toast_store = create_toast(unauthorized_toast_elem);
    $user_not_found_toast_store = create_toast(user_unavailable_toast_elem);
    $password_unmatched_toast_store = create_toast(
      password_unmatched_toast_elem,
    );
    $banned_toast_store = create_toast(banned_toast_elem);
    $student_id_misformation_toast_store = create_toast(
      student_id_misformation_toast_elem,
    );
    $roll_out_of_range_toast_store = create_toast(roll_out_of_range_toast_elem);
    $improper_username_toast_store = create_toast(improper_username_toast_elem);
    $invalid_email_toast_store = create_toast(invalid_email_toast_elem);
    $duplicate_username_student_id_toast_store = create_toast(
      duplicate_username_student_id_toast_elem,
    );
    $duplicate_puzzle_level_store = create_toast(duplicate_puzzle_level_elem);
    $asked_too_many_otp_toast_store = create_toast(
      asked_too_many_otp_toast_elem,
    );
    $otp_mismatch_toast_store = create_toast(otp_mismatch_toast_elem);
    $Invalid_otp_user_toast_store = create_toast(Invalid_otp_user_toast_elem);
    $otp_time_limit_over_toast_store = create_toast(
      otp_time_limit_over_toast_elem,
    );
    $otp_user_id_mail_exists_toast_store = create_toast(
      otp_user_already_verified_toast_elem,
    );
    $otp_user_nonexistent_toast_store = create_toast(
      otp_user_nonexistent_toast_elem,
    );
    $otp_user_already_verified_toast_store = create_toast(
      otp_user_already_verified_toast_elem,
    );
    $otp_username_exists_toast_store = create_toast(
      otp_username_exists_toast_elem,
    );
    $otp_student_id_exists_toast_store = create_toast(
      otp_student_id_exists_toast_elem,
    );
    $otp_mail_exists_toast_store = create_toast(otp_mail_exists_toast_elem);
    $otp_sent_toast_store = create_toast(otp_sent_toast_elem);
    $email_not_found_toast_store = create_toast(email_not_found_toast_elem);
    $email_send_failed_toast_store = create_toast(email_send_failed_toast_elem);
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
    class="toast align-items-center text-bg-danger border-0"
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
      <div class="toast-body">Student ID is of improper format</div>
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
      <div class="toast-body">Student roll is out of valid range</div>
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
      <div class="toast-body">Username must be alphanumeric with no spaces</div>
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
      <div class="toast-body">Invalid Email address given</div>
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
      <div class="toast-body">Username already in use</div>
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
      <div class="toast-body">Puzzle with same level already exists</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={asked_too_many_otp_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">
        Too many OTPs requested for this email, please use a different email
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
    bind:this={otp_mismatch_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">OTP verification failed</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={Invalid_otp_user_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">OTP submitted for invalid user</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_time_limit_over_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">OTP time limit exceeded</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_user_id_mail_exists_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Username/Student ID/email already in use</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_user_nonexistent_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">OTP submitted for non existent user</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_user_already_verified_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">OTP submitted for already verified user</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_username_exists_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Username already in use</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_student_id_exists_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Studnet ID already in use</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_mail_exists_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Email already in use</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={otp_sent_toast_elem}
    class="toast align-items-center text-bg-success border-0"
  >
    <div class="d-flex">
      <div class="toast-body">OTP sent</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={email_not_found_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Email not found</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
  <div
    bind:this={email_send_failed_toast_elem}
    class="toast align-items-center text-bg-danger border-0"
  >
    <div class="d-flex">
      <div class="toast-body">Email sending failed</div>
      <button
        type="button"
        class="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
  </div>
</div>
