<script lang="ts">
  import { admin_logged_in_state } from "$lib/stores";
  import "$lib/style.scss";
</script>

{#if $admin_logged_in_state}
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="/admin">Picture Puzzle 2024 Admin</a>
      <div class="flex-fill d-flex justify-content-between">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="/admin/puzzle">Puzzle</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/admin/meme">Meme</a>
          </li>
        </ul>
        <button class="btn btn-primary">Logout</button>
      </div>
    </div>
  </nav>
{/if}

<slot></slot>
