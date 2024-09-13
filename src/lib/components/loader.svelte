<script lang="ts">
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import { tweened } from "svelte/motion";
  import { fade } from "svelte/transition";

  let loading = false;
  let length = tweened(0);

  beforeNavigate(() => {
    loading = true;

    length
      .set(0, {
        duration: 0,
      })
      .then(() => {
        length
          .set(75, {
            duration: 10000,
            easing: cubicOut,
          })
          .then(() => {
            length.set(90, {
              duration: 60000,
              easing: cubicOut,
            });
          });
      });
  });

  afterNavigate(() => {
    length
      .set(100, {
        duration: 500,
        easing: cubicInOut,
      })
      .then(() => {
        loading = false;
      });
  });
</script>

{#if loading}
  <div
    transition:fade={{ duration: 250, easing: cubicInOut }}
    class="progress position-absolute top-0 start-0 end-0 rounded-0 z-2"
    style="height: 0.25rem;"
  >
    <div class="progress-bar" style={`width: ${$length}%`}></div>
  </div>
{/if}
