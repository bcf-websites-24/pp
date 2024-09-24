<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    email_not_found_toast_store,
    email_send_failed_toast_store,
    otp_sent_toast_store,
    too_many_otp_mismatch_toast_store,
  } from "$lib/stores";
  import { slide } from "svelte/transition";

  let email: string;
  let sending_email: boolean = false;

  function send_otp(): void {
    sending_email = true;

    fetch("/api/users/reset_pwd", {
      method: "POST",
      body: JSON.stringify({
        email: email,
      }),
    })
      .then(async (response: Response): Promise<void> => {
        if (response.status === 200) {
          const response_json = await response.json();
          const reset = parseInt(response_json.reset);

          if (reset === 0) {
            $otp_sent_toast_store.show();
            goto("/reset");
          } else if (reset === -1) {
            $email_not_found_toast_store.show();
          } else if (reset === -2) {
            $email_send_failed_toast_store.show();
          } else if (reset === -5) {
            $too_many_otp_mismatch_toast_store.show();
          }
        }
      })
      .finally((): void => {
        sending_email = false;
      });
  }
</script>

<div
  class="position-absolute top-0 bottom-0 start-0 end-0 d-flex align-items-center justify-content-center"
>
  <form
    on:submit={send_otp}
    action="javascript:"
    class="card card-body shadow d-flex flex-column align-items-stretch border-0 m-2"
    style="max-width: 30rem;"
  >
    <p class="fs-3">Forgor password? T_T</p>
    <div class="form-floating mb-3">
      <input
        bind:value={email}
        type="email"
        class="form-control"
        id="forgor-email"
        placeholder="Email"
        name="email"
        required
      />
      <label for="forgor-username">Email</label>
    </div>
    <div class="d-flex align-items-center justify-content-end gap-2">
      <a href="/login" class="link-underline link-underline-opacity-0">Home</a>
      <button class="btn btn-primary" disabled={sending_email}>
        Send OTP
      </button>
      {#if sending_email}
        <div
          transition:slide={{ duration: 250, axis: "x" }}
          class="d-flex align-items-center ps-2"
        >
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      {/if}
    </div>
  </form>
</div>
