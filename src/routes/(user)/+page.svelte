<script>
  import Player from "$lib/components/user/player.svelte";
  import Stranger from "$lib/components/user/stranger.svelte";
  import { user_logged_in_state } from "$lib/stores";
</script>

{#if $user_logged_in_state}
  <Player />
{:else}
  <Stranger />
{/if}
