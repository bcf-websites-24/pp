<script>
  import { page } from "$app/stores";
  import Error from "$lib/components/error.svelte";
  import Signin from "$lib/components/user/signin.svelte";
</script>

{#if $page.status === 401}
  <Signin />
{:else}
  <Error />
{/if}
