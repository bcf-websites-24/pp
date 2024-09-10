<script lang="ts">
  import "$lib/style.scss";
  import {
    correct_answer_toast_store,
    fail_toast_store,
    password_unmatched_toast_store,
    success_toast_store,
    unauthorized_toast_store,
    user_not_found_toast_store,
    wrong_answer_toast_store,
  } from "$lib/stores";
  import { Toast } from "bootstrap";
  import { onMount } from "svelte";

  let correct_answer_toast_elem: HTMLDivElement;
  let wrong_answer_toast_elem: HTMLDivElement;
  let success_toast_elem: HTMLDivElement;
  let fail_toast_elem: HTMLDivElement;
  let unauthorized_toast_elem: HTMLDivElement;
  let user_unavailable_toast_elem: HTMLDivElement;
  let password_unmatched_toast_elem: HTMLDivElement;

  onMount((): void => {
    $correct_answer_toast_store = new Toast(correct_answer_toast_elem);
    $wrong_answer_toast_store = new Toast(wrong_answer_toast_elem);
    $success_toast_store = new Toast(success_toast_elem);
    $fail_toast_store = new Toast(fail_toast_elem);
    $unauthorized_toast_store = new Toast(unauthorized_toast_elem);
    $user_not_found_toast_store = new Toast(user_unavailable_toast_elem);
    $password_unmatched_toast_store = new Toast(password_unmatched_toast_elem);
  });
</script>

<slot></slot>

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
</div>
