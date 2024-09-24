<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    email_not_found_toast_store,
    email_send_failed_toast_store,
    otp_sent_toast_store,
  } from "$lib/stores";
  import { slide } from "svelte/transition";

  let confirm_password_elem: HTMLInputElement;
  let email: string;
  let otp: string;
  let password: string;
  let confirm_password: string;
  let sending: boolean = false;

  function on_confirm_password_update(event: Event): void {
    (event.target as HTMLInputElement).setCustomValidity("");
  }

  function reset_pwd(): void {
    if (password !== confirm_password) {
      confirm_password_elem.setCustomValidity("Password did not match");
      confirm_password_elem.reportValidity();

      return;
    }

    sending = true;

    fetch("/api/users/update_pwd", {
      method: "POST",
      body: JSON.stringify({
        is_reset: true,
        email: email,
        otp: otp,
        new_password: password,
      }),
    })
      .then(async (response: Response): Promise<void> => {
        if (response.status === 200) {
          const response_json = await response.json();
          const updated = parseInt(response_json.updated);

          console.log(response_json);
        }
      })
      .finally((): void => {
        sending = false;
      });
  }
</script>

<div
  class="position-absolute top-0 bottom-0 start-0 end-0 d-flex align-items-center justify-content-center"
>
  <form
    on:submit={reset_pwd}
    class="card card-body shadow d-flex flex-column align-items-stretch border-0 m-2"
    style="max-width: 30rem;"
  >
    <p class="fs-3">Set New Password</p>
    <div class="form-floating mb-3">
      <input
        bind:value={email}
        type="email"
        class="form-control"
        id="reset-email"
        placeholder="Email"
        name="email"
        required
      />
      <label for="forgor-username">Email</label>
    </div>
    <div class="form-floating mb-3">
      <input
        bind:value={otp}
        type="text"
        class="form-control"
        id="reset-otp"
        placeholder="OTP"
        minlength="4"
        maxlength="4"
        name="otp"
        required
      />
      <label for="forgor-username">OTP</label>
    </div>
    <div class="form-floating mb-3">
      <input
        bind:value={password}
        type="password"
        class="form-control"
        id="reset-password"
        placeholder="New Password"
        minlength="8"
        name="reset-password"
        required
      />
      <label for="forgor-username">New Password</label>
    </div>
    <div class="form-floating mb-3">
      <input
        bind:this={confirm_password_elem}
        bind:value={confirm_password}
        on:change={on_confirm_password_update}
        type="password"
        class="form-control"
        id="reset-confirm-password"
        placeholder="Confirm Password"
        minlength="8"
        name="reset-confirm-password"
        required
      />
      <label for="forgor-username">Confirm Password</label>
    </div>
    <div class="d-flex align-items-center justify-content-end gap-2">
      <a href="/login" class="link-underline link-underline-opacity-0">Home</a>
      <button class="btn btn-primary" disabled={sending}>Update</button>
      {#if sending}
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
