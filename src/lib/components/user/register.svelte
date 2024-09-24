<script lang="ts">
  import { goto } from "$app/navigation";
  import { student_id_pattern, username_pattern } from "$lib/helpers";
  import {
    asked_too_many_otp_toast_store,
    duplicate_username_student_id_toast_store,
    email_send_failed_toast_store,
    improper_username_toast_store,
    invalid_email_toast_store,
    otp_mail_exists_toast_store,
    otp_mismatch_toast_store,
    otp_sent_toast_store,
    otp_student_id_exists_toast_store,
    otp_time_limit_over_toast_store,
    otp_user_already_verified_toast_store,
    otp_user_nonexistent_toast_store,
    otp_username_exists_toast_store,
    roll_out_of_range_toast_store,
    student_id_misformation_toast_store,
  } from "$lib/stores";
  import { onMount } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";
  import { slide } from "svelte/transition";

  const sections = 4;
  export let login_mode: boolean;
  export let reset: boolean;
  export let signing: boolean;
  export let height: number;
  export let onformupdate: () => void;

  $: on_set_login_mode(login_mode);

  function on_set_login_mode(login_mode: boolean) {
    if (!login_mode) {
      if (!reset) {
        state = 3;
        height = heights[state];
        $translate = -(width / sections) * state;

        onformupdate();
      }
    }
  }

  export function reg_reset(): void {
    state = 0;
    height = heights[state];
    $translate = -(width / sections) * state;

    form_elems.forEach((elem: HTMLFormElement): void => {
      elem.reset();
    });

    reset = true;
  }

  let state = 0;
  let width: number;
  let form_elems = new Array<HTMLFormElement>(sections);
  let heights = new Array<number>(sections);
  let register_confirm_password_elem: HTMLInputElement;
  let register_username: string;
  let register_email: string;
  let register_student_id: string;
  let register_password: string;
  let register_confirm_password: string;
  let register_otp: string;
  let translate = tweened(0, {
    duration: 250,
    easing: cubicInOut,
  });

  function on_confirm_password_update(event: Event): void {
    (event.target as HTMLInputElement).setCustomValidity("");
  }

  function restart() {
    state = 0;
    $translate = -(width / sections) * state;
    height = heights[state];

    onformupdate();

    reset = true;
    register_otp = "";
  }

  function inc_state() {
    ++state;
    $translate = -(width / sections) * state;
    height = heights[state];

    onformupdate();
  }

  function next(): void {
    if (state === 2) {
      if (register_password !== register_confirm_password) {
        register_confirm_password_elem.setCustomValidity(
          "Password did not match",
        );
        register_confirm_password_elem.reportValidity();

        return;
      }

      signing = true;

      fetch("/api/users/register", {
        method: "POST",
        body: JSON.stringify({
          username: register_username,
          student_id: register_student_id,
          email: register_email,
          password: register_password,
        }),
      }).then(async (response) => {
        if (response.status === 200) {
          const response_json: any = await response.json();

          if (response_json.registered === 0) {
            inc_state();
            $otp_sent_toast_store.show();
          } else {
            if (response_json.registered === -2) {
              $student_id_misformation_toast_store.show();
            } else if (response_json.registered === -3) {
              $roll_out_of_range_toast_store.show();
            } else if (response_json.registered === -4) {
              $improper_username_toast_store.show();
            } else if (response_json.registered === -6) {
              $invalid_email_toast_store.show();
            } else if (response_json.registered === -7) {
              $duplicate_username_student_id_toast_store.show();
            } else if (response_json.registered === -8) {
              $email_send_failed_toast_store.show();
            } else if (response_json.registered === -9) {
              $asked_too_many_otp_toast_store.show();
            } else if (response_json.registered === -10) {
              $otp_mail_exists_toast_store.show();
            } else if (response_json.registered === -11) {
              $otp_student_id_exists_toast_store.show();
            } else {
              console.error("Unknown registered value");
            }

            restart();
          }
        }
        signing = false;
      });
    } else if (state === 3) {
      signing = true;

      fetch("/api/users/otp", {
        method: "POST",
        body: JSON.stringify({
          otp: register_otp,
        }),
      }).then(async (response) => {
        signing = false;

        if (response.status === 200) {
          const response_json = await response.json();

          if (response_json.registered === 0) {
            goto("/", { invalidateAll: true });
          } else if (response_json.registered === -1) {
            $otp_mismatch_toast_store.show();
          } else if (response_json.registered === -2) {
            $otp_user_nonexistent_toast_store.show();
          } else if (response_json.registered === -3) {
            $otp_time_limit_over_toast_store.show();
          } else if (response_json.registered === -4) {
            $otp_user_already_verified_toast_store.show();
          } else if (response_json.registered === -5) {
            $otp_username_exists_toast_store.show();
          } else if (response_json.registered === -6) {
            $otp_student_id_exists_toast_store.show();
          } else if (response_json.registered === -7) {
            $otp_mail_exists_toast_store.show();
          } else {
            console.log("Unknown verification value.");
          }
        }
      });
    } else {
      inc_state();
    }
  }

  function back(): void {
    --state;
    $translate = -(width / sections) * state;
    height = heights[state];

    onformupdate();
  }

  function resend_otp(): void {
    signing = true;

    fetch("/api/users/resend").finally((): void => {
      signing = false;
    });
  }

  onMount((): void => {
    height = heights[state];
  });
</script>

<div style="height: {height}px; min-width: 50%; max-width: 50%;">
  <div
    bind:clientWidth={width}
    class="d-flex align-items-start h-100"
    style={`width: ${sections}00%; transform: translate(${$translate}px, 0);`}
  >
    <form
      bind:this={form_elems[0]}
      on:submit={next}
      bind:clientHeight={heights[0]}
      class="w-100 p-1"
      action="javascript:"
    >
      <div class="form-floating mb-3">
        <input
          bind:value={register_username}
          type="text"
          class="form-control"
          id="register-username"
          placeholder="Username"
          name="username"
          pattern={username_pattern.source}
          required
        />
        <label for="register-username">Username</label>
      </div>
      <div class="form-floating mb-3">
        <input
          bind:value={register_student_id}
          type="text"
          class="form-control"
          id="register-student-id"
          placeholder="Stuent ID"
          name="studentid"
          pattern={student_id_pattern.source}
          required
        />
        <label for="register-student-id">Student ID</label>
        <p class="fs-6 text-secondary mb-0">
          *7 digits student ID (e. g. 1905039)
        </p>
      </div>
      <div class="d-flex align-items-center justify-content-end">
        <button type="submit" class="btn btn-primary">Next</button>
      </div>
    </form>
    <form
      bind:this={form_elems[1]}
      on:submit={next}
      bind:clientHeight={heights[1]}
      class="w-100 p-1"
      action="javascript:"
    >
      <div class="form-floating mb-3">
        <input
          bind:value={register_email}
          type="email"
          class="form-control"
          id="register-email"
          name="email"
          placeholder="Email"
          required
        />
        <label for="register-email">Email</label>
      </div>
      <div class="d-flex justify-content-end">
        <button
          on:click={back}
          type="button"
          class="btn btn-link link-underline link-underline-opacity-0 me-2"
          >Back</button
        >
        <button type="submit" class="btn btn-primary">Next</button>
      </div>
    </form>
    <form
      bind:this={form_elems[2]}
      on:submit={next}
      bind:clientHeight={heights[2]}
      class="w-100 p-1"
      action="javascript:"
    >
      <div class="form-floating mb-3">
        <input
          bind:value={register_password}
          type="password"
          class="form-control"
          id="register-password"
          placeholder="Password"
          name="password"
          minlength="8"
          required
        />
        <label for="register-password">Password</label>
      </div>
      <div class="form-floating mb-3">
        <input
          bind:value={register_confirm_password}
          bind:this={register_confirm_password_elem}
          on:input={on_confirm_password_update}
          type="password"
          class="form-control"
          id="register-confirm-password"
          placeholder="Confirm Password"
          name="confirmpassword"
          minlength="8"
          required
        />
        <label for="register-confirm-password">Confirm Password</label>
      </div>
      <div class="d-flex justify-content-end align-items-center">
        <button
          on:click={back}
          type="button"
          class="btn btn-link link-underline link-underline-opacity-0 me-2"
          disabled={signing}>Back</button
        >
        <button type="submit" class="btn btn-primary" disabled={signing}
          >Register</button
        >
        {#if signing}
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
    <form
      bind:this={form_elems[3]}
      on:submit={next}
      bind:clientHeight={heights[3]}
      class="w-100 p-1"
      action="javascript:"
    >
      <div class="form-floating mb-1">
        <input
          bind:value={register_otp}
          type="text"
          class="form-control"
          id="register-otp"
          placeholder="OTP"
          name="otp"
          minlength="4"
          maxlength="4"
          required
        />
        <label for="register-password">OTP</label>
      </div>
      <button
        on:click={resend_otp}
        type="button"
        class="btn btn-link link-underline link-underline-opacity-0 p-0 mb-3"
        disabled={signing}
      >
        Resend OTP
      </button>
      <div class="d-flex justify-content-end align-items-center">
        <button
          on:click={restart}
          type="button"
          class="btn btn-link link-underline link-underline-opacity-0 me-2"
          disabled={signing}>Reset</button
        >
        <button type="submit" class="btn btn-primary" disabled={signing}
          >Verify</button
        >
        {#if signing}
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
</div>
