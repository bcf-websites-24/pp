<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Error from "$lib/components/error.svelte";
  import { handle_unauthorized_admin } from "$lib/helpers";

  onMount((): void => {
    if ($page.status === 401) {
      handle_unauthorized_admin();
    }
  });
</script>

<Error />
