<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  export let name: string;
  export let answer: string;
  export let img_url: string;
  let img_loading = false;
  let img_data: string;

  $: load_image(img_url);

  function load_image(url: string): void {
    img_loading = true;

    fetch("/api/admin/puzzle/get_image", {
      method: "POST",
      body: JSON.stringify({
        url: url,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        const response_blob = await response.blob();
        img_data = URL.createObjectURL(response_blob);
      } else if (response.status === 403) {
        goto("/admin");
      }
    });
  }
</script>

<img src={img_data} class="puzzle-image rounded me-2" alt="puzzle-img" />
<div class="flex-fill d-flex flex-column justify-content-between">
  <div>
    <p class="fs-5 fw-semibold m-0">Name: {name}</p>
    <p class="fs-6 text-secondary m-0">Answer: {answer}</p>
  </div>
  <div class="d-flex justify-content-end">
    <button class="btn btn-link link-secondary p-0 me-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-pencil-square"
        viewBox="0 0 16 16"
      >
        <path
          d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
        />
        <path
          fill-rule="evenodd"
          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
        />
      </svg>
    </button>
    <button class="btn btn-link link-danger p-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-trash"
        viewBox="0 0 16 16"
      >
        <path
          d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
        />
        <path
          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
        />
      </svg>
    </button>
  </div>
</div>

<style>
  .puzzle-image {
    height: 5rem;
  }
</style>
