<script lang="ts">
  import type { AdminPuzzleItem } from "$lib/helpers";
  import { onMount } from "svelte";

  export let puzzle: AdminPuzzleItem;
  export let puzzles: Array<AdminPuzzleItem>;

  onMount((): void => {
    const index = puzzles.indexOf(puzzle);

    if (index === -1) {
      return;
    }

    puzzles = puzzles.slice(0, index).concat(puzzles.slice(index + 1));

    fetch("/api/admin/rmv_puzzle", {
      method: "POST",
      body: JSON.stringify({
        puzzle_id: puzzle.id,
      }),
    });
  });
</script>
