<script lang="ts">
  import { page } from "$app/stores";
  import Dice_0 from "$lib/components/decorations/dice-0.svelte";
  import Dice_1 from "$lib/components/decorations/dice-1.svelte";
  import Puzzle_0 from "$lib/components/decorations/puzzle-0.svelte";
  import Puzzle_1 from "$lib/components/decorations/puzzle-1.svelte";
  import Error from "$lib/components/error.svelte";
  import Signin from "$lib/components/user/signin.svelte";
  import { logout_user } from "$lib/helpers";
  import { onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  let mounted = false;

  onMount((): void => {
    if ($page.status === 403) {
      logout_user(true);
    }

    mounted = true;
  });
</script>

{#if mounted}
  <div
    in:fade={{ delay: 250, duration: 750, easing: cubicOut }}
    class="position-absolute top-0 left-0 w-100 h-100 z-n1"
  >
    <Puzzle_0 />
    <Puzzle_1 />
    <Dice_0 />
    <Dice_1 />
  </div>
{/if}

{#if $page.status === 401}
  <Signin />
{:else}
  <Error />
{/if}
