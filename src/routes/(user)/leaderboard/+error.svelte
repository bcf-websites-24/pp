<script lang="ts">
  import { page } from "$app/stores";
  import Error from "$lib/components/error.svelte";
  import {
    handle_unauthorized_user,
    handle_unverified_user,
    logout_user,
  } from "$lib/helpers";
  import { onMount } from "svelte";

  onMount((): void => {
    if ($page.status === 401) {
      handle_unauthorized_user();
    } else if ($page.status === 403) {
      logout_user(true);
    } else if ($page.status === 406) {
      handle_unverified_user();
    }
  });
</script>

<Error />
