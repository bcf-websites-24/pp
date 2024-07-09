<script lang="ts">
  import { page } from "$app/stores";
  import Error from "$lib/components/error.svelte";
  import { user_logged_in_state } from "$lib/stores";
  import { Tab } from "bootstrap";
  import { onMount } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";

  const username_pattern = /^\w{4,32}$/;
  const student_id_pattern = /^\d{9}$/;
  let mounted = false;
  let form_holder_elem: HTMLDivElement;
  let forms_elem: HTMLDivElement;
  let form_login_elem: HTMLFormElement;
  let form_register_elem: HTMLFormElement;
  let register_student_id_elem: HTMLInputElement;
  let register_confirm_password_elem: HTMLInputElement;
  let signing: boolean = false;
  let login_username: string;
  let login_password: string;
  let register_username: string;
  let register_email: string;
  let register_student_id: string;
  let register_password: string;
  let register_confirm_password: string;
  let form_translate = tweened(0, {
    duration: 250,
    easing: cubicInOut,
  });
  let form_height = tweened(0, {
    duration: 250,
    easing: cubicInOut,
  });

  async function login(): Promise<void> {
    signing = true;
    const response: Response = await fetch("/api/users/login", {
      method: "POST",
      body: JSON.stringify({
        username: login_username,
        password: login_password,
      }),
    });

    if (response.status === 200) {
      const response_json: any = await response.json();

      if (response_json.login === 0) {
        location.href = "/";
      } else if (response_json.login === -1) {
      } else if (response_json.login === -2) {
      } else {
        console.error("Unknown login value");
      }
    }

    signing = false;

    form_login_elem.reset();
  }

  async function register(): Promise<void> {
    if (register_password !== register_confirm_password) {
      register_confirm_password_elem.setCustomValidity(
        "Password did not match",
      );

      return;
    }

    signing = true;
    const response: Response = await fetch("/api/users/register", {
      method: "POST",
      body: JSON.stringify({
        username: register_username,
        student_id: register_student_id,
        email: register_email,
        password: register_password,
      }),
    });

    if (response.status === 200) {
      const response_json: any = await response.json();

      if (response_json.registered === 0) {
        location.href = "/";
      } else if (response_json.registered === -1) {
      } else {
        console.error("Unknown registered value");
      }
    }

    signing = false;

    form_register_elem.reset();
  }

  function login_tab_clicked(): void {
    $form_translate = 0;
    $form_height = form_login_elem.clientHeight;
  }

  function register_tab_clicked(): void {
    $form_translate = -forms_elem.clientWidth / 2;
    $form_height = form_register_elem.clientHeight;
  }

  onMount((): void => {
    $user_logged_in_state = false;
    $form_height = form_login_elem.clientHeight;
    mounted = true;
  });
</script>

{#if $page.status === 403}
  <div class="stranger-root">
    <div>
      <p class="fs-5 text-center text-secondary mb-0">Welcome to</p>
      <p class="fs-1 text-center">Picture Puzzle 2024</p>
      <div class="stranger-card card card-body shadow m-2">
        <div class="nav nav-pills mb-3">
          <button
            on:click={login_tab_clicked}
            class="nav-link active"
            data-bs-toggle="tab">Login</button
          >
          <button
            on:click={register_tab_clicked}
            class="nav-link"
            data-bs-toggle="tab">Register</button
          >
        </div>
        <div
          bind:this={form_holder_elem}
          class="align-self-stretch overflow-hidden"
        >
          <div
            bind:this={forms_elem}
            class="d-flex"
            style="width: 200%; transform: translate({$form_translate}px, 0); {mounted
              ? `height: ${$form_height}px`
              : ''}"
          >
            <form
              bind:this={form_login_elem}
              on:submit={login}
              class="w-100 p-1"
              action="javascript:"
              style="height: fit-content;"
            >
              <div class="form-floating mb-3">
                <input
                  bind:value={login_username}
                  type="text"
                  class="form-control"
                  id="login-username"
                  placeholder="Username"
                  pattern={username_pattern.source}
                  required
                />
                <label for="login-username">Username</label>
              </div>
              <div class="form-floating mb-3">
                <input
                  bind:value={login_password}
                  type="password"
                  class="form-control"
                  id="login-password"
                  placeholder="Password"
                  required
                />
                <label for="login-password">Password</label>
              </div>
              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-primary" disabled={signing}
                  >Login</button
                >
              </div>
            </form>
            <form
              bind:this={form_register_elem}
              on:submit={register}
              class="w-100 p-1"
              action="javascript:"
              style="height: fit-content;"
            >
              <div class="form-floating mb-3">
                <input
                  bind:value={register_username}
                  type="text"
                  class="form-control"
                  id="register-username"
                  placeholder="Username"
                  pattern={username_pattern.source}
                  required
                />
                <label for="register-username">Username</label>
              </div>
              <div class="form-floating mb-3">
                <input
                  bind:value={register_email}
                  type="email"
                  class="form-control"
                  id="register-email"
                  placeholder="Email"
                  minlength="8"
                  required
                />
                <label for="register-email">Email</label>
              </div>
              <div class="form-floating mb-3">
                <input
                  bind:value={register_student_id}
                  bind:this={register_student_id_elem}
                  type="text"
                  class="form-control"
                  id="register-student-id"
                  placeholder="Stuent ID"
                  pattern={student_id_pattern.source}
                  required
                />
                <label for="register-student-id">Student ID</label>
              </div>
              <div class="form-floating mb-3">
                <input
                  bind:value={register_password}
                  type="password"
                  class="form-control"
                  id="register-password"
                  placeholder="Password"
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
                  minlength="8"
                  required
                />
                <label for="register-confirm-password">Confirm Password</label>
              </div>
              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-primary" disabled={signing}
                  >Register</button
                >
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <Error />
{/if}

<style>
  .stranger-root {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stranger-card {
    max-width: 30rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 0;
  }
</style>
