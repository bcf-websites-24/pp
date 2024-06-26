<script lang="ts">
  import { current_level_state, next_level_url_state } from "$lib/stores";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let image_data: string;
  let image_loaded = false;

  onMount((): void => {
    fetch("/api/puzzles/get_image_data", {
      method: "POST",
      body: JSON.stringify({
        url: $next_level_url_state,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        const response_blob = await response.blob();
        image_data = URL.createObjectURL(response_blob);
        image_loaded = true;
      } else if (response.status === 403) {
        // unauthorised, deal later
      }
    });
  });
</script>

<div class="player-root mx-auto mt-4 p-2">
  <p class="fs-3 fw-semibold text-center">Level: {$current_level_state}</p>
  {#if image_loaded}
    <img
      src={image_data}
      class="puzzle-img rounded"
      alt="puzzle-img"
      in:fade={{ duration: 250 }}
    />
  {:else}
    <div class="placeholder-glow">
      <span class="image-placeholder placeholder bg-secondary rounded"></span>
    </div>
  {/if}
</div>

<style>
  .player-root {
    max-width: 40rem;
  }
  .puzzle-img {
    width: 100%;
  }
  .image-placeholder {
    width: 100%;
    aspect-ratio: 1;
  }
</style>
