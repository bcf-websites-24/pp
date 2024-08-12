<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  export let show_puzzle: boolean;
  let image_data: string;
  let image_loaded = false;

  function next(): void {
    show_puzzle = true;
  }

  onMount((): void => {
    fetch("/api/memes/random").then(
      async (response: Response): Promise<void> => {
        if (response.status === 200) {
          const form_data = await response.formData();
          const image_blob_entry: FormDataEntryValue | null =
            form_data.get("image");

          if (image_blob_entry) {
            image_data = URL.createObjectURL(image_blob_entry.slice() as Blob);
            image_loaded = true;
          } else {
          }
        } else {
        }
      },
    );
  });
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
    <div class="placeholder-glow mb-3">
      <span class="image-placeholder placeholder bg-secondary rounded"></span>
    </div>
  {/if}
  <div class="d-flex justify-content-center align-items-center">
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
