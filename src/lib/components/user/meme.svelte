<script lang="ts">
  import { fade } from "svelte/transition";

  export let show_puzzle: boolean;
  let image_data: string;
  let image_loaded = false;

  function next(): void {
    show_puzzle = true;
  }
</script>

<div class="page-root mx-auto mt-4 p-2">
  {#if image_loaded}
    <img
      src={image_data}
      class="meme-img rounded mb-3"
      alt="meme-img"
      in:fade={{ duration: 250 }}
    />
  {:else}
    <div class="placeholder-glow">
      <span class="image-placeholder placeholder bg-secondary rounded"></span>
    </div>
  {/if}
  <div class="d-flex justify-content-center align-items-center mt-2">
    <button on:click={next} class="btn btn-primary" type="button">
      <span>Next</span>
    </button>
  </div>
</div>

<style>
  .meme-img {
    width: 100%;
  }
  .image-placeholder {
    width: 100%;
    aspect-ratio: 1;
  }
</style>
