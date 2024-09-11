<script lang="ts">
  import { handle_unauthorized_user, logout_user } from "$lib/helpers";
  import {
    current_level_state,
    next_level_id_state,
    next_level_url_state,
    wrong_answer_toast_store,
    correct_answer_toast_store,
    current_rank_state,
    server_error_toast_store,
  } from "$lib/stores";
  import { fade, slide } from "svelte/transition";

  // export let show_puzzle: boolean;
  let image_data: string;
  let image_loaded = false;
  let submitting = false;
  let wrong_answer = false;
  let answer: string;
  let answer_submit_form_elem: HTMLFormElement;

  $: load_puzzle($next_level_id_state, $next_level_url_state);

  function answer_submit(): void {
    submitting = true;

    fetch("/api/puzzles/ans_puzzle", {
      method: "POST",
      body: JSON.stringify({
        puzzle_id: $next_level_id_state,
        ans: answer,
      }),
    })
      .then(async (response: Response): Promise<void> => {
        if (response.status === 200) {
          const response_json = await response.json();

          // console.log(response_json);

          if (response_json.ans.f_is_correct) {
            $correct_answer_toast_store.show();

            $next_level_id_state = response_json.ans.f_next_puzzle_id;
            $next_level_url_state = response_json.ans.f_next_puzzle_img_url;
            $current_level_state = response_json.ans.f_next_puzzle_level;
            $current_rank_state = response_json.ans.f_rank;
          } else {
            wrong_answer = true;

            $wrong_answer_toast_store.show();
            setTimeout((): void => {
              wrong_answer = false;
            }, 3000);
          }

          submitting = false;
        } else if (response.status === 401) {
          handle_unauthorized_user();
        } else if (response.status === 403) {
          logout_user(true);
        } else if (response.status === 500) {
          $server_error_toast_store.show();
        }
      })
      .finally(() => {
        answer = "";
      });
  }

  function load_puzzle(id: number | null, level_url: string): void {
    if (level_url === "" || id === null) {
      return;
    }

    wrong_answer = false;
    image_loaded = false;

    if (answer_submit_form_elem !== undefined) {
      answer_submit_form_elem.reset();
    }

    fetch("/api/puzzles/get_image_data", {
      method: "POST",
      body: JSON.stringify({
        url: level_url,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        const response_blob = await response.blob();
        image_data = URL.createObjectURL(response_blob);
        image_loaded = true;
      } else if (response.status === 401) {
        handle_unauthorized_user();
      } else if (response.status === 403) {
        logout_user(true);
      } else if (response.status === 500) {
        $server_error_toast_store.show();
      }
    });
  }
</script>

<div class="page-root mx-auto mt-4 p-2">
  {#if $next_level_id_state === null}
    <div
      in:fade={{ duration: 250 }}
      class="d-flex flex-column align-items-center w-100"
    >
      <p class="fs-1 fw-bold mb-0">Wow! You solved all the puzzles</p>
      <p class="fs-5 text-secondary mb-4">Wait for more...</p>
      <img
        src="/pochita.webp"
        class="puzzle-img rounded mt-4"
        alt="pochita-img"
      />
    </div>
  {:else}
    <p class="fs-3 fw-semibold text-center">Level: {$current_level_state}</p>
    {#if image_loaded}
      <img
        src={image_data}
        class="puzzle-img rounded mb-3"
        alt="puzzle-img"
        in:fade={{ duration: 250 }}
      />
      <div class="d-flex align-items-center mb-4">
        <form
          bind:this={answer_submit_form_elem}
          on:submit={answer_submit}
          class="input-group"
          action="javascript:"
          in:fade={{ duration: 250 }}
        >
          <input
            bind:value={answer}
            type="text"
            class="form-control {wrong_answer ? 'is-invalid' : ''}"
            placeholder="Answer..."
            required
          />
          <button class="btn btn-primary" type="submit" disabled={submitting}>
            <span>Submit</span>
          </button>
        </form>
        {#if submitting}
          <div transition:slide={{ duration: 250, axis: "x" }}>
            <div class="spinner-border text-primary ms-2"></div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="placeholder-glow mb-4">
        <span class="image-placeholder placeholder bg-secondary rounded"></span>
      </div>
    {/if}
  {/if}
</div>

<style>
  .puzzle-img {
    width: 100%;
  }
  .image-placeholder {
    width: 100%;
    aspect-ratio: 1;
  }
</style>
