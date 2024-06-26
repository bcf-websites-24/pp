<script>
  import Player from "$lib/components/player.svelte";
  import Stranger from "$lib/components/stranger.svelte";
  import { logged_in_state } from "$lib/stores";
</script>

{#if $logged_in_state}
  <Player />
{:else}
  <Stranger />
{/if}
