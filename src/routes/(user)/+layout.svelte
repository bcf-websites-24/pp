<script lang="ts">
  import { logout_user } from "$lib/helpers";
  import {
    current_level_state,
    current_rank_state,
    next_level_id_state,
    next_level_url_state,
    user_logged_in_state,
    username_state,
  } from "$lib/stores";
  import { onMount } from "svelte";

  export let data: any;
  let rank_text: string = "Unranked";

  $: rank_text =
    $current_rank_state === -1 ? "Unranked" : $current_rank_state.toString();

  onMount(() => {
    if (data.details !== null && data.details !== undefined) {
      $user_logged_in_state = true;
      $username_state = data.details.username;
      $current_level_state = data.details.curr_level + 1;
      $next_level_id_state = data.details.next_puzzle_id;
      $next_level_url_state = data.details.next_puzzle_url;
      $current_rank_state = data.details.user_rank
        ? data.details.user_rank
        : -1;
    }
  });
</script>

{#if $user_logged_in_state}
  <nav
    class="navbar navbar-expand-lg bg-body-tertiary shadow-sm position-sticky top-0 z-1"
  >
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
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
            <li>
              <p class="fs-4 fw-semibold pt-1 px-3 m-0">{$username_state}</p>
              {#if $next_level_id_state !== null}
                <p class="text-body-secondary px-3 m-0">
                  Level: {$current_level_state}
                </p>
              {/if}
              <p class="text-body-secondary pb-1 px-3 m-0">Rank: {rank_text}</p>
            </li>
            <li>
              <hr class="dropdown-divider mx-3" />
            </li>
            <li>
              <a class="dropdown-item" href="/leaderboard">Leaderboard</a>
            </li>
            <li>
              <button on:click={() => logout_user(false)} class="dropdown-item"
                >Logout</button
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
{/if}

<slot></slot>
