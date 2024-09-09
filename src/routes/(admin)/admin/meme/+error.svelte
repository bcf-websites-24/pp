<script lang="ts">
  import { page } from "$app/stores";
  import { handle_unauthorized_admin } from "$lib/helpers";
  import { onMount } from "svelte";

  onMount((): void => {
    if ($page.status === 401) {
      handle_unauthorized_admin();
    }
  });
</script>
