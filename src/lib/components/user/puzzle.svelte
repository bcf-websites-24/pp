<script lang="ts">
  import {
    handle_unauthorized_user,
    handle_unverified_user,
    logout_user,
  } from "$lib/helpers";
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
  import Japanese from "../decorations/japanese.svelte";
  import { tweened } from "svelte/motion";
  import { cubicInOut } from "svelte/easing";
  import { PUBLIC_STORAGE_CDN_ENDPOINT } from "$env/static/public";

  let img_src: string;
  let submitting = false;
  let wrong_answer = false;
  let answer: string;
  let answer_submit_form_elem: HTMLFormElement;
  let puzzle_opacity = tweened(0.0, {
    duration: 250,
    easing: cubicInOut,
  });

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
            }, 1000);
          }

          submitting = false;
        } else if (response.status === 401) {
          handle_unauthorized_user();
        } else if (response.status === 403) {
          logout_user(true);
        } else if (response.status === 406) {
          handle_unverified_user();
        } else if (response.status === 500) {
          $server_error_toast_store.show();
        }
      })
      .finally(() => {
        answer = "";
      });
  }

  function onimage_load() {
    $puzzle_opacity = 1.0;
  }

  function load_puzzle(id: number | null, level_url: string): void {
    if (level_url === "" || id === null) {
      return;
    }

    $puzzle_opacity = 0.0;
    wrong_answer = false;
    img_src = `${PUBLIC_STORAGE_CDN_ENDPOINT}/puzzle/${level_url}`;
  }
</script>

<div class="page-root mx-auto mt-4 p-2">
  {#if $next_level_id_state === null}
    <div
      in:fade={{ delay: 100, duration: 250 }}
      class="d-flex flex-column align-items-center w-100"
    >
      <p class="fs-1 fw-bold mb-0">Wow! You solved all the puzzles</p>
      <img
        src="/pochita.webp"
        class="puzzle-img rounded mt-4"
        alt="pochita-img"
      />
      <p class="fs-5 text-secondary my-4">Wait for more...</p>
    </div>
  {:else}
    <p class="fs-3 fw-semibold text-center">Level: {$current_level_state}</p>
    <div class="position-relative">
      <div
        class="position-absolute top-0 start-0 end-0 d-flex align-items-center justify-content-center gap-2 mt-4"
        style={`opacity: ${1 - $puzzle_opacity}`}
      >
        <p class="text-secondary m-0">Loading Puzzle</p>
        <div
          class="spinner-border spinner-border-sm text-primary"
          role="status"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div style={`opacity: ${$puzzle_opacity}`}>
        <img
          src={img_src}
          on:load={onimage_load}
          class="puzzle-img rounded mb-3"
          alt="puzzle-img"
        />
        <div class="d-flex align-items-center mb-4">
          <Japanese />
          <form
            bind:this={answer_submit_form_elem}
            on:submit={answer_submit}
            class="input-group"
            action="javascript:"
          >
            <input
              bind:value={answer}
              type="text"
              class="form-control {wrong_answer ? 'is-invalid' : ''}"
              placeholder="Answer..."
              required
            />
            <button
              class="btn btn-primary z-0"
              type="submit"
              disabled={submitting}
            >
              <span>Submit</span>
            </button>
          </form>
          {#if submitting}
            <div transition:slide={{ duration: 250, axis: "x" }}>
              <div class="spinner-border text-primary ms-2"></div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  <img loading="lazy" src="/much-heck.jpeg" alt="much-heck" hidden />
</div>

<style>
  .puzzle-img {
    width: 100%;
  }
</style>
