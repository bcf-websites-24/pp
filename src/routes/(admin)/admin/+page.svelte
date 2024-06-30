<script lang="ts">
  import AdminLoggedIn from "$lib/components/admin/AdminLoggedIn.svelte";
  import AdminNotLoggedIn from "$lib/components/admin/AdminNotLoggedIn.svelte";
  import { admin_logged_in_state } from "$lib/stores";
</script>

{#if $admin_logged_in_state}
  <AdminLoggedIn />
{:else}
  <AdminNotLoggedIn />
{/if}
