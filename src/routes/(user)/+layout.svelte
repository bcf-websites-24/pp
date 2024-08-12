<script lang="ts">
  import {
    current_level_state,
    current_rank_state,
    user_logged_in_state,
    username_state,
  } from "$lib/stores";

  let rank_text: string = "Unranked";

  $: rank_text =
    $current_rank_state === -1 ? "Unranked" : $current_rank_state.toString();
</script>

{#if $user_logged_in_state}
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">Picture Puzzle 2024</a>
      <div class="d-flex justify-content-end">
        <div class="dropdown">
          <button
            class="btn btn-link link-secondary px-0"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-bs-auto-close="outside"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              class="bi bi-person-circle"
              viewBox="0 0 16 16"
            >
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              <path
                fill-rule="evenodd"
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
              />
            </svg>
          </button>
          <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
            <li>
              <p class="fs-4 fw-semibold pt-1 px-3 m-0">{$username_state}</p>
              <p class="text-body-secondary px-3 m-0">
                Level: {$current_level_state}
              </p>
              <p class="text-body-secondary pb-1 px-3 m-0">Rank: {rank_text}</p>
            </li>
            <li>
              <hr class="dropdown-divider mx-3" />
            </li>
            <li>
              <a class="dropdown-item" href="/leaderboard">Leaderboard</a>
            </li>
            <li>
              <button class="dropdown-item">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
{/if}

<slot></slot>
