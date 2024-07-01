<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { admin_logged_in_state } from "$lib/stores";
  import { onMount } from "svelte";

  onMount((): void => {
    if ($page.status === 403) {
      goto("/admin");
    }
  });
</script>
