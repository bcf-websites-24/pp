<script lang="ts">
  import { handle_unauthorized_admin } from "$lib/helpers";
  import {
    admin_logged_in_state,
    fail_toast_store,
    server_error_toast_store,
    success_toast_store,
  } from "$lib/stores";
  import { onMount } from "svelte";

  export let data: any;
  let submitting: boolean = false;
  let given_highest_puzzle_level: number = 10;
  let puzzle_limit_form_elem: HTMLFormElement;
  let puzzle_limit: number = 40;

  function submit_input(): void {
    submitting = true;
    change_limit(given_highest_puzzle_level);
    submitting = false;
  }

  function change_limit(given_highest_puzzle_level: number): void {
    fetch("/api/admin/update_limit", {
      method: "POST",
      body: JSON.stringify({
        highest_puzzle_level: given_highest_puzzle_level,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status == 200) {
        let response_json = await response.json();

        if (response_json[0].const_value === given_highest_puzzle_level) {
          $success_toast_store.show();
          puzzle_limit = response_json[0].const_value;
        } else {
          $fail_toast_store.show();
        }

        puzzle_limit_form_elem.reset();
      } else if (response.status === 401) {
        handle_unauthorized_admin();
      } else if (response.status === 500) {
        $server_error_toast_store.show();
      } else if (response.status === 422) {
        $fail_toast_store.show();
      }
    });
  }

  onMount((): void => {
    $admin_logged_in_state = true;

    if (data.puzzle_level) {
      console.log(data.puzzle_level);
      puzzle_limit = data.puzzle_level[0].const_value;
    }
  });
</script>

<div class="admin-page-root mx-auto mt-4 p-2">
  <form
    bind:this={puzzle_limit_form_elem}
    on:submit={submit_input}
    class="card card-body shadow border-0 mb-4"
    action="javascript:"
  >
    <div class="add-puzzle-input p-1">
      <label for="answer-input" class="form-label">Highest Puzzle Level</label>
      <input
        bind:value={given_highest_puzzle_level}
        id="answer-input"
        type="number"
        class="form-control"
        autocomplete="off"
        required
      />
    </div>
    <div class="d-flex justify-content-end px-1">
      <button type="reset" class="btn btn-outline-danger me-2">Reset</button>
      <button type="submit" class="btn btn-primary" disabled={submitting}
        >Set highest level</button
      >
    </div>
  </form>

  Current Highest Level: {puzzle_limit}
</div>
