<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Error from "$lib/components/error.svelte";
  import Register from "$lib/components/user/register.svelte";
  import { username_pattern } from "$lib/helpers";
  import { user_logged_in_state } from "$lib/stores";
  import { Tab } from "bootstrap";
  import { onMount } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";

  let mounted = false;
  let form_holder_elem: HTMLDivElement;
  let reg_height: number;
  let forms_elem: HTMLDivElement;
  let login_form_height: number;
  let login_form_elem: HTMLFormElement;
  let signing: boolean = false;
  let login_username: string;
  let login_password: string;
  let form_translate = tweened(0, {
    duration: 250,
    easing: cubicInOut,
  });
  let form_height = tweened(0, {
    duration: 250,
    easing: cubicInOut,
  });

  let reg_reset: () => void;

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
        goto("/", { invalidateAll: true });
      } else if (response_json.login === -1) {
      } else if (response_json.login === -2) {
      } else {
        console.error("Unknown login value");
      }
    }

    signing = false;

    login_form_elem.reset();
  }

  function login_tab_clicked(): void {
    reg_reset();

    $form_translate = 0;
    $form_height = login_form_height;
  }

  function register_tab_clicked(): void {
    login_form_elem.reset();

    $form_translate = -forms_elem.clientWidth / 2;
    $form_height = reg_height;
  }

  function reg_next(): void {
    $form_height = reg_height;
  }

  onMount((): void => {
    $user_logged_in_state = false;
    login_form_height = login_form_elem.clientHeight;
    $form_height = login_form_height;
    mounted = true;
  });
</script>

{#if $page.status === 403}
  <div class="stranger-root">
    <div class="stranger-root-1">
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
            class="d-flex align-items-start"
            style="width: 200%; transform: translate({$form_translate}px, 0); {mounted
              ? `height: ${$form_height}px`
              : ''}"
          >
            <div style="min-width: 50%; max-width: 50%;">
              <form
                bind:this={login_form_elem}
                on:submit={login}
                class="w-100 p-1"
                action="javascript:"
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
                  <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={signing}>Login</button
                  >
                </div>
              </form>
            </div>
            <Register
              bind:signing
              bind:height={reg_height}
              onformupdate={reg_next}
              bind:reset={reg_reset}
            />
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
  .stranger-root-1 {
    max-width: 100%;
  }
  .stranger-card {
    max-width: 30rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 0;
  }
</style>
