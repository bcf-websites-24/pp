<script lang="ts">
  import Meme from "$lib/components/user/meme.svelte";
  import Puzzle from "$lib/components/user/puzzle.svelte";
  import {
    current_level_state,
    user_logged_in_state,
    next_level_id_state,
    next_level_url_state,
    current_rank_state,
    username_state,
  } from "$lib/stores";
  import { onMount } from "svelte";

  export let data: any;
  // let show_puzzle = true;

  onMount((): void => {
    if (data.details !== null) {
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

<Puzzle />
<!-- {#if show_puzzle}
  <Puzzle bind:show_puzzle />
{:else}
  <Meme bind:show_puzzle />
{/if} -->
