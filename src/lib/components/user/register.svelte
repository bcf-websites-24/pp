<script lang="ts">
  import { student_id_pattern, username_pattern } from "$lib/helpers";
  import {
    duplicate_username_student_id_toast_store,
    improper_username_toast_store,
    invalid_email_toast_store,
    roll_out_of_range_toast_store,
    student_id_misformation_toast_store,
  } from "$lib/stores";
  import { onMount } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";
  import { slide } from "svelte/transition";

  export let signing: boolean;
  export let height: number;
  export let onformupdate: () => void;

  export function reset(): void {
    state = 0;
    height = heights[state];
    $translate = -(width / 3) * state;

    form_elems.forEach((elem: HTMLFormElement): void => {
      elem.reset();
    });
  }

  let state = 0;
  let width: number;
  let form_elems = new Array<HTMLFormElement>(3);
  let heights = new Array<number>(3);
  let register_student_id_elem: HTMLInputElement;
  let register_confirm_password_elem: HTMLInputElement;
  let register_username: string;
  let register_email: string;
  let register_student_id: string;
  let register_password: string;
  let register_confirm_password: string;
  let translate = tweened(0, {
    duration: 250,
    easing: cubicInOut,
  });

  async function register(): Promise<void> {
    if (register_password !== register_confirm_password) {
      register_confirm_password_elem.setCustomValidity(
        "Password did not match",
      );

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
        } else {
          console.error("Unknown registered value");
        }
      }

      signing = false;
    });
  }

  function next(): void {
    ++state;
    $translate = -(width / 3) * state;
    height = heights[state];

    if (state === 3) {
      register();
    }

    onformupdate();
  }

  function back(): void {
    --state;
    $translate = -(width / 3) * state;
    height = heights[state];

    onformupdate();
  }

  onMount((): void => {
    height = heights[state];
  });
</script>

<div style="height: {height}px; min-width: 50%; max-width: 50%;">
  <div
    bind:clientWidth={width}
    class="d-flex align-items-start h-100"
    style="width: 300%; transform: translate({$translate}px, 0);"
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
          bind:this={register_student_id_elem}
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
          *9 digits student ID (e. g. 201905039)
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
      on:submit={register}
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
  </div>
</div>
