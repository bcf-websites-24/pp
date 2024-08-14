<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  onMount((): void => {
    if ($page.status === 403) {
      goto("/admin");
    }
  });
</script>
