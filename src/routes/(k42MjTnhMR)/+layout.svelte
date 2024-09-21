<script lang="ts">
  import "$lib/styles/global.scss";
  import { admin_logged_in_state, server_error_toast_store } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { handle_unauthorized_admin } from "$lib/helpers";

  function logout(): void {
    fetch("/api/admin/logout").then((response) => {
      if (response.status === 200) {
        goto("/k42MjTnhMR", { invalidateAll: true });
      } else if (response.status === 401) {
        handle_unauthorized_admin();
      } else if (response.status === 500) {
        $server_error_toast_store.show();
      }
    });
  }
</script>

{#if $admin_logged_in_state}
  <nav
    class="navbar navbar-expand-lg bg-body-tertiary shadow-sm position-sticky top-0 z-1"
  >
    <div class="container-fluid">
      <a class="navbar-brand" href="/k42MjTnhMR">Picture Puzzle 2024 Admin</a>
      <div class="flex-fill d-flex justify-content-between">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="/k42MjTnhMR/puzzle">Puzzle</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/k42MjTnhMR/submissions">Submissions</a>
          </li>
        </ul>
        <button on:click={logout} class="btn btn-primary">Logout</button>
      </div>
    </div>
  </nav>
{/if}

<slot></slot>
