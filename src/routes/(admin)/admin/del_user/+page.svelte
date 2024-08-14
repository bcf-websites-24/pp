<script lang="ts">
  import {
    admin_logged_in_state,
    fail_toast_store,
    success_toast_store,
  } from "$lib/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let user_name: string;
  let submitting = false;
  let del_user_form_elem: HTMLFormElement;

  function delete_user(): void {
    submitting = true;

    fetch("/api/admin/rmv_user", {
      method: "POST",
      body: JSON.stringify({
        username: user_name,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        let data = await response.json();
        if (data.success === 1) {
          $success_toast_store.show();
        } else {
          $fail_toast_store.show();
        }
        // console.log(data);
        submitting = false;
      } else if (response.status === 403) {
        goto("/admin");
      } else {
        $fail_toast_store.show();
        submitting = false;
      }
      user_name = "";
    });
  }

  onMount((): void => {
    $admin_logged_in_state = true;
  });
</script>

<div class="admin-page-root mx-auto my-4 p-2">
  <form
    bind:this={del_user_form_elem}
    on:submit={delete_user}
    class="card card-body shadow border-0 mb-4"
    action="javascript:"
  >
    <p class="fs-3 fw-semibold mb-2 mx-1">Enter User Name</p>
    <div class="px-1">
      <input
        class="form-control"
        type="text"
        bind:value={user_name}
        placeholder="User name..."
        required
      />
      <div class="d-flex justify-content-end mt-2 mx-1">
        <button type="submit" class="btn btn-danger" disabled={submitting}
          >Remove User</button
        >
      </div>
    </div>
  </form>
</div>
