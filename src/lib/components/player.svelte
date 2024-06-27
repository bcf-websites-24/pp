<script lang="ts">
  import {
    current_level_state,
    next_level_id_state,
    next_level_url_state,
  } from "$lib/stores";
  import { fade } from "svelte/transition";

  let puzzle_loading = false;
  let image_data: string;
  let image_loaded = false;
  let submitting = false;
  let wrong_answer = false;
  let answer: string;
  let player_root_loaded_elem: HTMLDivElement;
  let answer_submit_form_elem: HTMLFormElement;
  let submitting_animator_elem: HTMLDivElement;

  $: load_puzzle($next_level_url_state);

  function answer_submit(): void {
    submitting = true;

    {
      submitting_animator_elem.hidden = false;
      const target_width = submitting_animator_elem.clientHeight;

      submitting_animator_elem
        .animate(
          [
            {
              width: "0",
            },
            {
              width: target_width + "px",
            },
          ],
          100,
        )
        .play();
    }

    fetch("/api/puzzles/ans_puzzle", {
      method: "POST",
      body: JSON.stringify({
        puzzle_id: $next_level_id_state,
        ans: answer,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        const response_json = await response.json();

        if (response_json.is_correct_ans) {
          const animation = player_root_loaded_elem.animate(
            [
              {
                opacity: 1,
              },
              {
                opacity: 0,
              },
            ],
            100,
          );
          animation.onfinish = (): void => {
            puzzle_loading = true;
          };

          animation.play();
        } else {
          wrong_answer = true;

          setTimeout((): void => {
            wrong_answer = false;
          }, 3000);
        }

        {
          const init_width = submitting_animator_elem.clientHeight;
          const animation = submitting_animator_elem.animate(
            [
              {
                width: init_width + "px",
              },
              {
                width: init_width + "px",
              },
            ],
            100,
          );
          animation.onfinish = (): void => {
            submitting_animator_elem.hidden = true;
          };

          animation.play();
        }

        submitting = false;
      } else if (response.status === 403) {
        // unauthorised, deal later
      }
    });

    answer_submit_form_elem.reset();
  }

  function load_puzzle(level_url: string): void {
    wrong_answer = false;
    image_loaded = false;

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
      } else if (response.status === 403) {
        // unauthorised, deal later
      }
    });
  }
</script>

{#if puzzle_loading}
  <div
    class="position-absolute top-0 bottom-0 start-0 end-0 d-flex flex-column justify-content-center align-items-center"
    in:fade={{ duration: 250 }}
  >
    <p class="text-beat fs-4 text-secondary">Loading Next Puzzle...</p>
  </div>
{:else}
  <div
    bind:this={player_root_loaded_elem}
    class="player-root-loaded mx-auto mt-4 p-2"
    in:fade={{ duration: 250 }}
  >
    <p class="fs-3 fw-semibold text-center">Level: {$current_level_state}</p>
    {#if image_loaded}
      <img
        src={image_data}
        class="puzzle-img rounded mb-3"
        alt="puzzle-img"
        in:fade={{ duration: 250 }}
      />
      <div class="d-flex align-items-center">
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
            <span>Send</span>
          </button>
        </form>
        <div bind:this={submitting_animator_elem} hidden>
          <div class="spinner-border text-primary ms-2"></div>
        </div>
      </div>
      {#if wrong_answer}
        <div
          class="alert alert-danger mt-2"
          transition:fade={{ duration: 250 }}
        >
          Oops! Wrong Answer
        </div>
      {/if}
    {:else}
      <div class="placeholder-glow">
        <span class="image-placeholder placeholder bg-secondary rounded"></span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .text-beat {
    animation-name: text-beat-animation;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }
  .player-root-loaded {
    max-width: 40rem;
  }
  .puzzle-img {
    width: 100%;
  }
  .image-placeholder {
    width: 100%;
    aspect-ratio: 1;
  }
  @keyframes text-beat-animation {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
