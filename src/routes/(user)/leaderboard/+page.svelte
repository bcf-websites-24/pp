<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Leaderboard from "$lib/components/decorations/leaderboard.svelte";
  import {
    current_level_state,
    current_rank_state,
    next_level_id_state,
    next_level_url_state,
    user_logged_in_state,
    username_state,
  } from "$lib/stores";
  import type { Page } from "@sveltejs/kit";

  type Stat = {
    rank: number;
    username: string;
    current_level: number;
    batch: string;
    somiti_score: number;
  };

  const PAGE_SIZE = 100;
  let players = new Array<Stat>();
  let prev_pages = new Array<number>();
  let next_pages = new Array<number>();
  let page_count = 0;
  let current_page = 0;
  let next_disabled = true;
  let prev_disabled = true;

  $: load_page($page);

  function load_page(page: Page<Record<string, string>, string | null>): void {
    if (page.data.details !== null && page.data.details !== undefined) {
      $user_logged_in_state = true;
      $username_state = page.data.details.username;
      $current_level_state = parseInt(page.data.details.curr_level) + 1;
      $next_level_id_state = page.data.details.next_puzzle_id;
      $next_level_url_state = page.data.details.next_puzzle_url;
      $current_rank_state = page.data.details.user_rank
        ? page.data.details.user_rank
        : -1;
    }

    players = new Array(page.data.players.length);

    for (let i = 0; i < players.length; ++i) {
      let batch_2digit = page.data.players[i].f_student_id
        .toString()
        .substring(0, 2);
      batch_2digit = parseInt(batch_2digit);
      let batch_4digit =
        batch_2digit > 23 ? batch_2digit + 1900 : batch_2digit + 2000;

      players[i] = {
        rank: parseInt(page.data.players[i].f_rank),
        username: page.data.players[i].f_username,
        current_level: parseInt(page.data.players[i].f_curr_level),
        batch: batch_4digit,
        somiti_score: parseFloat(page.data.players[i].f_shomobay_score),
      };
    }

    page_count = Math.ceil(parseInt(page.data.metadata) / PAGE_SIZE);

    const page_param = page.url.searchParams.get("page");

    if (page_param === null) {
      current_page = 1;
    } else {
      current_page = parseInt(page_param);

      if (isNaN(current_page)) {
        current_page = 1;
      }
    }

    prev_pages = [];
    next_pages = [];

    const start = Math.max(1, current_page - 2);
    const end = Math.min(page_count, current_page + 2);

    for (let i = start; i < current_page; ++i) {
      prev_pages.push(i);
    }

    for (let i = current_page + 1; i <= end; ++i) {
      next_pages.push(i);
    }

    if (start === 1) {
      for (
        let i = end + 1;
        prev_pages.length + next_pages.length < 4 && i <= page_count;
        ++i
      ) {
        next_pages.push(i);
      }
    } else if (end === page_count) {
      let to_add = [];

      for (
        let i = start - 1;
        to_add.length + prev_pages.length + next_pages.length < 4 && i >= 1;
        --i
      ) {
        to_add.push(i);
      }

      prev_pages = to_add.reverse().concat(prev_pages);
    }

    if (current_page > 1) {
      prev_disabled = false;
    } else {
      prev_disabled = true;
    }

    if (current_page < page_count) {
      next_disabled = false;
    } else {
      next_disabled = true;
    }
  }

  function next_page(): void {
    goto(`/leaderboard?page=${current_page + 1}`);
  }

  function prev_page(): void {
    goto(`/leaderboard?page=${current_page - 1}`);
  }

  function first_page(): void {
    goto("/leaderboard?page=1");
  }

  function last_page(): void {
    if (page_count > 0) {
      goto(`/leaderboard?page=${page_count}`);
    } else {
      goto("/leaderboard?page=1");
    }
  }
</script>

<div class="page-root position-relative mx-auto mt-4 p-2">
  <Leaderboard />
  <p class="fs-3 fw-semibold text-center">Leaderboard</p>
  <div class="card card-body border-0 shadow-sm mb-4">
    <div class="table-responsive">
      <table class="table p-2 m-0">
        <thead class="text-nowrap">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Username</th>
            <th scope="col">Batch</th>
            <th scope="col">Solved</th>
          </tr>
        </thead>
        <tbody>
          {#each players as player}
            <tr>
              <th
                style={`background-color: rgb(255, ${255.0 - player.somiti_score * 127.5}, ${255.0 - player.somiti_score * 127.5}); !important`}
                scope="row">{player.rank}</th
              >
              <td
                style={`background-color: rgb(255, ${255.0 - player.somiti_score * 127.5}, ${255.0 - player.somiti_score * 127.5}); !important`}
                >{player.username}</td
              >
              <td
                style={`background-color: rgb(255, ${255.0 - player.somiti_score * 127.5}, ${255.0 - player.somiti_score * 127.5}); !important`}
                >{player.batch}</td
              >
              <td
                style={`background-color: rgb(255, ${255.0 - player.somiti_score * 127.5}, ${255.0 - player.somiti_score * 127.5}); !important`}
                >{player.current_level}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  {#if page_count > 1}
    <div class="d-flex justify-content-center">
      <div class="btn-group">
        <button
          on:click={first_page}
          class="btn btn-sm btn-link"
          disabled={prev_disabled}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="m17 16-4-4 4-4m-6 8-4-4 4-4"
            />
          </svg>
        </button>
        <button
          on:click={prev_page}
          class="btn btn-sm btn-link"
          disabled={prev_disabled}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="m14 8-4 4 4 4"
            />
          </svg>
        </button>
        {#each prev_pages as page}
          <button
            on:click={() => {
              goto(`/leaderboard?page=${page}`);
            }}
            class="btn btn-sm btn-link link-underline link-underline-opacity-0 d-flex align-items-center"
          >
            <p class="fs-5 my-auto">{page}</p>
          </button>
        {/each}
        <button
          class="btn btn-sm btn-link link-underline link-underline-opacity-0 border rounded border-3 d-flex align-items-center"
        >
          <p class="fs-5 my-auto">{current_page}</p>
        </button>
        {#each next_pages as page}
          <button
            on:click={() => {
              goto(`/leaderboard?page=${page}`);
            }}
            class="btn btn-sm btn-link link-underline link-underline-opacity-0 d-flex align-items-center"
          >
            <p class="fs-5 my-auto">{page}</p>
          </button>
        {/each}
        <button
          on:click={next_page}
          class="btn btn-sm btn-link link-underline link-underline-opacity-0"
          disabled={next_disabled}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="m10 16 4-4-4-4"
            />
          </svg>
        </button>
        <button
          on:click={last_page}
          class="btn btn-sm btn-link"
          disabled={next_disabled}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="m7 16 4-4-4-4m6 8 4-4-4-4"
            />
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>
