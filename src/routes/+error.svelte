<script lang="ts">
  import { page } from "$app/stores";
  import Error from "$lib/components/error.svelte";
  import Signin from "$lib/components/user/signin.svelte";
  import { logout_user } from "$lib/helpers";
  import { onMount } from "svelte";

  onMount((): void => {
    if ($page.status === 403) {
      logout_user(true);
    }
  });
</script>

{#if $page.status === 401}
  <Signin />
{:else}
  <Error />
{/if}
