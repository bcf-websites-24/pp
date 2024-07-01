<script lang="ts">
  import { goto } from "$app/navigation";
  import { AdminPuzzleItem } from "$lib/helpers";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  export let puzzles: Array<AdminPuzzleItem>;
  export let puzzle: AdminPuzzleItem;
  let deleting = false;
  let img_loading = false;
  let item_elem: HTMLLIElement;

  $: load_image(puzzle.img_url);

  function fetch_img(url: string): void {
    fetch("/api/admin/puzzle/get_image", {
      method: "POST",
      body: JSON.stringify({
        url: url,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        const response_blob = await response.blob();
        puzzle.img_data = URL.createObjectURL(response_blob);
        img_loading = false;
      } else if (response.status === 403) {
        goto("/admin");
      }
    });
  }

  function load_image(url: string): void {
    if (puzzle.img_data.length > 0) {
      return;
    }

    img_loading = true;

    if (puzzle.loaded) {
      fetch_img(url);
    } else {
      const target_height = item_elem.clientHeight;
      const animation = item_elem.animate(
        [
          {
            height: "0",
            easing: "ease-out",
          },
          {
            height: target_height + "px",
            easing: "ease-in",
          },
        ],
        250,
      );
      animation.onfinish = (): void => {
        fetch_img(url);
      };

      animation.play();
    }
  }

  function delete_puzzle(): void {
    const init_height = item_elem.clientHeight;
    const animation = item_elem.animate(
      [
        {
          height: init_height + "px",
          easing: "ease-out",
        },
        {
          height: "0",
          easing: "ease-in",
        },
      ],
      250,
    );

    animation.onfinish = (): void => {
      const index = puzzles.indexOf(puzzle);

      if (index === -1) {
        return;
      }

      puzzles = puzzles.slice(0, index).concat(puzzles.slice(index + 1));
    };

    animation.play();
  }
</script>

<li bind:this={item_elem} class="list-group-item p-0">
  <div class="d-flex flex-wrap align-items-start py-2">
    {#if img_loading}
      <div class="placeholder-glow">
        <span class="puzzle-image rounded bg-secondary placeholder me-2"></span>
      </div>
    {:else}
      <a href={puzzle.img_data} target="_blank" in:fade={{ duration: 250 }}>
        <img
          src={puzzle.img_data}
          class="puzzle-image rounded me-2"
          alt="puzzle-img"
        />
      </a>
    {/if}

    <div class="flex-fill d-flex flex-column justify-content-between">
      <div>
        <p class="fs-5 fw-semibold m-0">Level: {puzzle.level}</p>
        <p class="fs-6 text-secondary m-0">Answer: {puzzle.answer}</p>
      </div>
      <div class="d-flex justify-content-end">
        <button
          class="btn btn-link link-secondary p-0 me-3"
          disabled={deleting}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-pencil-square"
            viewBox="0 0 16 16"
          >
            <path
              d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
            />
            <path
              fill-rule="evenodd"
              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
            />
          </svg>
        </button>
        <button
          on:click={delete_puzzle}
          class="btn btn-link link-danger p-0"
          disabled={deleting}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-trash"
            viewBox="0 0 16 16"
          >
            <path
              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
            />
            <path
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</li>

<style>
  .puzzle-image {
    width: 5rem;
    height: 5rem;
    object-fit: cover;
  }
</style>
