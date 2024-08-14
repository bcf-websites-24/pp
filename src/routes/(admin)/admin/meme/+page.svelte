<script lang="ts">
  import {
    admin_logged_in_state,
    fail_toast_store,
    success_toast_store,
  } from "$lib/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { AdminMemeItem } from "$lib/helpers";
  import MemeItem from "$lib/components/admin/meme-item.svelte";

  export let data: any;
  let meme_submitting = false;
  let memes: Array<AdminMemeItem> = [];
  let add_meme_images: FileList;
  let add_meme_form_elem: HTMLFormElement;

  function meme_submit(): void {
    meme_submitting = true;
    const form_data = new FormData();

    form_data.append("editing", "false");
    form_data.append("meme_file", add_meme_images.item(0) as File);
    form_data.append("meme_id", "");
    fetch("/api/admin/meme", {
      method: "POST",
      body: form_data,
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        $success_toast_store.show();

        const response_json = await response.json();
        const new_meme: AdminMemeItem = {
          id: response_json.id,
          loaded: false,
          img_url: response_json.img_url,
          img_data: "",
        };

        memes.push(new_meme);

        memes = Array.from(memes);
        meme_submitting = false;

        add_meme_form_elem.reset();
      } else if (response.status === 403) {
        goto("/admin");
      } else {
        $fail_toast_store.show();
      }
    });
  }

  onMount((): void => {
    $admin_logged_in_state = true;

    if (data.memes) {
      memes = new Array<AdminMemeItem>(data.memes.length);

      for (let i = 0; i < memes.length; ++i) {
        memes[i] = {
          id: data.memes[i].f_id,
          loaded: true,
          img_url: data.memes[i].f_img_url,
          img_data: "",
        };
      }
    }
  });
</script>

<div class="admin-page-root mx-auto my-4 p-2">
  <form
    bind:this={add_meme_form_elem}
    on:submit={meme_submit}
    class="card card-body shadow border-0 mb-4"
    action="javascript:"
  >
    <p class="fs-3 fw-semibold mb-2 mx-1">Add Meme</p>
    <div class="px-1">
      <input
        bind:files={add_meme_images}
        class="form-control"
        type="file"
        required
      />
    </div>
    <div class="d-flex justify-content-end mt-2 mx-1">
      <button type="reset" class="btn btn-outline-danger me-2">Reset</button>
      <button type="submit" class="btn btn-primary" disabled={meme_submitting}
        >Add</button
      >
    </div>
  </form>

  <div class="card card-body shadow border-0">
    <p class="fs-3 fw-semibold">Memes</p>
    <ul class="list-group list-group-flush">
      {#each memes as meme, index}
        <MemeItem bind:meme bind:memes />
      {/each}
    </ul>
  </div>
</div>
