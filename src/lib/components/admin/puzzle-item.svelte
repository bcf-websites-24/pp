<script lang="ts">
  import { goto } from "$app/navigation";
  import { AdminPuzzleItem } from "$lib/helpers";
  import { fade, slide } from "svelte/transition";
  import { onMount } from "svelte";

  export let puzzles: Array<AdminPuzzleItem>;
  export let puzzle: AdminPuzzleItem;
  let editing = false;
  let deleting = false;
  let edit_submiting = false;
  let img_loading = false;
  let item_elem: HTMLLIElement;
  let edit_form_elem: HTMLFormElement;
  let edit_puzzle_level: number;
  let edit_puzzle_answer: string;
  let edit_puzzle_link: string;
  let edit_puzzle_files: FileList;

  $: load_puzzle(puzzle);

  function init_animation(): void {
    if (item_elem && !puzzle.loaded) {
      puzzle.loaded = true;
      const target_height = item_elem.clientHeight;
      item_elem
        .animate(
          [
            {
              height: "0",
              easing: "ease-in-out",
            },
            {
              height: target_height + "px",
            },
          ],
          250,
        )
        .play();
    }
  }

  function load_puzzle_img(url: string): void {
    if (puzzle.img_data.length === 0) {
      img_loading = true;

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
  }

  function load_puzzle(puzzle: AdminPuzzleItem): void {
    load_puzzle_img(puzzle.img_url);
    init_animation();
  }

  async function edit_submit(): Promise<void> {
    edit_submiting = true;
    let file: Blob;

    if (edit_puzzle_files) {
      file = edit_puzzle_files.item(0) as File;
    } else {
      file = await (await fetch(puzzle.img_data)).blob();
    }

    const form_data = new FormData();

    form_data.append("hashed_ans", edit_puzzle_answer);
    form_data.append("info_link", "");
    form_data.append("puzzle_level", edit_puzzle_level.toString());
    form_data.append("editing", "true");
    form_data.append("puzzle_file", file);
    form_data.append("puzzle_id", puzzle.id);
    fetch("/api/admin/puzzle", {
      method: "POST",
      body: form_data,
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        editing = false;
        const new_puzzle: AdminPuzzleItem = {
          id: puzzle.id,
          loaded: true,
          level: edit_puzzle_level,
          answer: edit_puzzle_answer,
          img_url: puzzle.img_url,
          img_data: URL.createObjectURL(file),
        };

        const index = puzzles.indexOf(puzzle);

        if (index === -1) {
          return;
        }

        puzzles = puzzles.slice(0, index).concat(puzzles.slice(index + 1));
        let put_in = puzzles.length;

        for (let i = 0; i < puzzles.length; ++i) {
          if (new_puzzle.level < puzzles[i].level) {
            put_in = i;

            break;
          }
        }

        puzzles = puzzles
          .slice(0, put_in)
          .concat([new_puzzle])
          .concat(puzzles.slice(put_in));
        edit_submiting = false;
      } else if (response.status === 403) {
        goto("/admin");
      }
    });
  }

  function edit_puzzle(): void {
    edit_puzzle_level = puzzle.level;
    edit_puzzle_answer = puzzle.answer;
    edit_puzzle_link = "";
    editing = true;
  }

  function cancel_edit(): void {
    edit_form_elem.reset();

    editing = false;
  }

  function delete_puzzle(): void {
    deleting = true;

    fetch("/api/admin/puzzle/rm", {
      method: "POST",
      body: JSON.stringify({
        puzzle_id: puzzle.id,
      }),
    }).then((response: Response): void => {
      if (response.status === 200) {
        const init_height = item_elem.clientHeight;
        const animation = item_elem.animate(
          [
            {
              height: init_height + "px",
              easing: "ease-in-out",
            },
            {
              height: "0",
            },
          ],
          250,
        );

        animation.onfinish = () => {
          const index = puzzles.indexOf(puzzle);
          puzzles = puzzles.slice(0, index).concat(puzzles.slice(index + 1));
          deleting = false;
        };

        animation.play();
      }
    });
  }

  onMount((): void => {
    init_animation();
  });
</script>

<li bind:this={item_elem} class="list-group-item p-0">
  <div class="py-2">
    <div class="d-flex flex-wrap align-items-start px-1">
      {#if img_loading}
        <div class="placeholder-glow">
          <span class="puzzle-image rounded bg-secondary placeholder me-2"
          ></span>
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

      <div class="flex-fill">
        <div>
          <p class="fs-4 fw-semibold m-0">Level: {puzzle.level}</p>
          <p class="fs-6 text-secondary m-0">Answer: {puzzle.answer}</p>
        </div>
      </div>
    </div>
    {#if editing}
      <div transition:slide={{ duration: 250, axis: "y" }}>
        <form
          bind:this={edit_form_elem}
          on:submit={edit_submit}
          class="py-2"
          action="javascript:"
        >
          <div class="edit-puzzle-pair">
            <div class="input-group p-1">
              <span class="edit-puzzle-field input-group-text">Level</span>
              <input
                bind:value={edit_puzzle_level}
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="input-group p-1">
              <span class="edit-puzzle-field input-group-text">Image</span>
              <input
                bind:files={edit_puzzle_files}
                type="file"
                class="form-control"
              />
            </div>
          </div>
          <div class="edit-puzzle-pair">
            <div class="input-group p-1">
              <span class="edit-puzzle-field input-group-text">Answer</span>
              <input
                bind:value={edit_puzzle_answer}
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="input-group p-1">
              <span class="edit-puzzle-field input-group-text">Link</span>
              <input
                bind:value={edit_puzzle_link}
                type="text"
                class="form-control"
              />
            </div>
          </div>
          <div class="d-flex justify-content-end mt-2 px-1">
            <button
              on:click={cancel_edit}
              type="button"
              class="btn btn-outline-danger me-2"
              disabled={edit_submiting}>Cancel</button
            >
            <button
              type="submit"
              class="btn btn-primary"
              disabled={edit_submiting}>Apply</button
            >
          </div>
        </form>
      </div>
    {/if}
    {#if !editing}
      <div transition:slide={{ duration: 250 }}>
        <div class="d-flex justify-content-end p-2">
          <button
            on:click={edit_puzzle}
            class="btn btn-link link-secondary p-0 me-3"
            disabled={deleting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
    {/if}
  </div>
</li>

<style>
  .puzzle-image {
    width: 5rem;
    height: 5rem;
    object-fit: cover;
  }
  .edit-puzzle-pair {
    display: flex;
  }
  .edit-puzzle-field {
    width: 5rem;
  }
  @media (max-width: 45rem) {
    .edit-puzzle-pair {
      display: block;
    }
  }
</style>
