<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Error from "$lib/components/error.svelte";
  import { admin_logged_in_state, server_error_toast_store } from "$lib/stores";
  import { onMount } from "svelte";

  let login_password: string;

  function admin_login(): void {
    fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        password: login_password,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        goto("/k42MjTnhMR", { invalidateAll: true });
      } else if (response.status === 500) {
        $server_error_toast_store.show();
      }
    });
  }

  onMount((): void => {
    $admin_logged_in_state = false;
  });
</script>

{#if $page.status === 401}
  <div
    class="position-absolute top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center"
  >
    <form
      on:submit={admin_login}
      class="admin-login-card card card-body border-0 shadow"
      action="javascript:"
    >
      <p class="fs-4 fw-semibold">Admin Login</p>
      <div class="form-floating">
        <input
          bind:value={login_password}
          type="password"
          class="form-control"
          id="floatingPassword"
          placeholder="Password"
          minlength="8"
          required
        />
        <label for="floatingPassword">Password</label>
      </div>
      <div class="d-flex align-items-center justify-content-end mt-2">
        <a href="/" class="link-underline link-underline-opacity-0 me-2">Home</a
        >
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
    </form>
  </div>

  <style>
    .admin-login-card {
      max-width: 30rem;
    }
  </style>
{:else}
  <Error />
{/if}
