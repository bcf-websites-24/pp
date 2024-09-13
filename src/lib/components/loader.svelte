<script lang="ts">
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import { tweened } from "svelte/motion";

  let length = tweened(0.0);
  let opacity = tweened(0.0);

  beforeNavigate(() => {
    opacity
      .set(1.0, {
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
        opacity
          .set(0.0, {
            duration: 500,
            easing: cubicInOut,
          })
          .then(() => {
            length.set(0.0, {
              duration: 0,
            });
          });
      });
  });
</script>

<div
  class="progress position-absolute top-0 start-0 end-0 rounded-0 bg-transparent z-2"
  style="height: 0.25rem;"
>
  <div
    class="progress-bar"
    style={`width: ${$length}%; opacity: ${$opacity};`}
  ></div>
</div>
