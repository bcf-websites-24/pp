<script lang="ts">
  import "$lib/style.scss";
  import { wrong_answer_toast_store } from "$lib/stores";
  import { Toast } from "bootstrap";
  import { onMount } from "svelte";

  let wrong_answer_toast_elem: HTMLDivElement;

  onMount((): void => {
    $wrong_answer_toast_store = new Toast(wrong_answer_toast_elem);
  });
</script>

<slot></slot>

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
</div>
