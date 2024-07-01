<script lang="ts">
  import { admin_logged_in_state } from "$lib/stores";
  import { onMount } from "svelte";

  onMount((): void => {
    $admin_logged_in_state = true;
  });
</script>
