<script lang="ts">
  import { admin_logged_in_state } from "$lib/stores";
  import { onMount } from "svelte";
  import PuzzleItem from "$lib/components/admin/puzzle-item.svelte";
  import { goto } from "$app/navigation";

  class AdminPuzzleItem {
    public level: number = -1;
    public name: string = "";
    public answer: string = "";
    public img_url: string = "";
  }

  export let data: any;
  let puzzle_submitting = false;
  let puzzles: Array<AdminPuzzleItem> = [];
  let add_puzzle_images: FileList;
  let add_puzzle_answer: string;
  let add_puzzle_level: number;
  let add_puzzle_link: string;
  let add_puzzle_form_elem: HTMLFormElement;

  function puzzle_submit(): void {
    puzzle_submitting = true;
    let temp_link: string = add_puzzle_link ?? "";
    const form_data = new FormData();

    form_data.append("hashed_ans", add_puzzle_answer);
    form_data.append("info_link", temp_link);
    form_data.append("puzzle_level", add_puzzle_level.toString());
    form_data.append("editing", "false");
    form_data.append("puzzle_file", add_puzzle_images.item(0) as File);
    form_data.append("puzzle_id", "");

    fetch("/api/admin/puzzle", {
      method: "POST",
      body: form_data,
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        puzzle_submitting = false;
      } else if (response.status === 403) {
        goto("/admin");
      }
    });

    add_puzzle_form_elem.reset();
  }

  onMount((): void => {
    $admin_logged_in_state = true;

    if (data.puzzles) {
      puzzles = new Array<AdminPuzzleItem>(data.puzzles.length);

      for (let i = 0; i < puzzles.length; ++i) {
        puzzles[i] = {
          name: data.puzzles[i].f_title,
          level: data.puzzles[i].f_puzzle_level,
          answer: data.puzzles[i].f_ans,
          img_url: data.puzzles[i].f_img_url,
        };
      }
    }
  });
</script>

<div class="page-root mx-auto my-4 p-2">
  <form
    bind:this={add_puzzle_form_elem}
    on:submit={puzzle_submit}
    class="card card-body shadow border-0 mb-4"
    action="javascript:"
  >
    <p class="fs-4 fw-semibold">Add Puzzle</p>
    <div class="container mb-2">
      <div class="row">
        <div class="col ps-0">
          <label for="answer-input" class="form-label">Answer</label>
          <input
            bind:value={add_puzzle_answer}
            id="answer-input"
            type="text"
            class="form-control"
            autocomplete="off"
            required
          />
        </div>
        <div class="col pe-0">
          <label for="puzzle-image-input" class="form-label">Image</label>
          <input
            bind:files={add_puzzle_images}
            id="puzzle-image-input"
            class="form-control mb-2"
            type="file"
            required
          />
        </div>
      </div>
      <div class="row">
        <div class="col ps-0">
          <label for="level-input" class="form-label">Level</label>
          <input
            bind:value={add_puzzle_level}
            id="level-input"
            type="number"
            class="form-control"
            autocomplete="off"
            required
          />
        </div>
        <div class="col pe-0">
          <label for="link-input" class="form-label">Link</label>
          <input
            bind:value={add_puzzle_link}
            id="link-input"
            class="form-control mb-2"
            autocomplete="off"
            type="url"
          />
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <button type="reset" class="btn btn-outline-danger me-2">Reset</button>
      <button type="submit" class="btn btn-primary" disabled={puzzle_submitting}
        >Add</button
      >
    </div>
  </form>

  <div class="card card-body shadow border-0">
    <p class="fs-4 fw-semibold">Puzzles</p>
    <ul class="list-group list-group-flush">
      {#each puzzles as item}
        <li class="list-group-item d-flex flex-wrap align-items-start px-0">
          <PuzzleItem
            name={item.name}
            level={item.level}
            answer={item.answer}
            img_url={item.img_url}
          />
        </li>
      {/each}
    </ul>
  </div>
</div>
