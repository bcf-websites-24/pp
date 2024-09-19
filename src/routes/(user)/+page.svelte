<script lang="ts">
  import { page } from "$app/stores";
  import Puzzle from "$lib/components/user/puzzle.svelte";
  import {
    current_level_state,
    current_rank_state,
    next_level_id_state,
    next_level_url_state,
    user_logged_in_state,
    username_state,
  } from "$lib/stores";
  import { onMount } from "svelte";

  onMount(() => {
    if ($page.data.details !== null && $page.data.details !== undefined) {
      $user_logged_in_state = true;
      $username_state = $page.data.details.username;
      $current_level_state = parseInt($page.data.details.curr_level) + 1;
      $next_level_id_state = $page.data.details.next_puzzle_id;
      $next_level_url_state = $page.data.details.next_puzzle_url;
      $current_rank_state = $page.data.details.user_rank
        ? $page.data.details.user_rank
        : -1;
    }
  });
</script>

<Puzzle />
