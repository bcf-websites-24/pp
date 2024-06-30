<script lang="ts">
  let add_puzzle_images: FileList;
  let add_puzzle_answer: string;
  let add_puzzle_form_elem: HTMLFormElement;

  function puzzle_submit(): void {
    add_puzzle_form_elem.reset();
  }
</script>

<div class="page-root mx-auto mt-4 p-2">
  <form
    bind:this={add_puzzle_form_elem}
    on:submit={puzzle_submit}
    class="card card-body shadow border-0 mb-4"
    action="javascript:"
  >
    <p class="fs-4 fw-semibold">Add Puzzle</p>
    <div class="container mb-2">
      <div class="row">
        <div class="col ps-0">
          <label for="answer-input" class="form-label">Answer</label>
          <input
            bind:value={add_puzzle_answer}
            id="answer-input"
            type="text"
            class="form-control"
            required
          />
        </div>
        <div class="col pe-0">
          <label for="puzzle-image-input" class="form-label">Image</label>
          <input
            bind:files={add_puzzle_images}
            id="puzzle-image-input"
            class="form-control mb-2"
            type="file"
            required
          />
        </div>
      </div>
      <div class="row">
        <div class="col ps-0">
          <label for="level-input" class="form-label">Level</label>
          <input id="level-input" type="number" class="form-control" required />
        </div>
        <div class="col pe-0">
          <label for="link-input" class="form-label">Link</label>
          <input
            id="link-input"
            class="form-control mb-2"
            type="url"
            required
          />
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <button type="reset" class="btn btn-outline-danger me-2">Reset</button>
      <button type="submit" class="btn btn-primary">Add</button>
    </div>
  </form>

  <div class="card card-body shadow border-0">
    <p class="fs-4 fw-semibold">Puzzles</p>
    <ul class="list-group list-group-flush">
      {#each new Array(2) as item, i}
        <li class="list-group-item d-flex flex-wrap px-0">
          <img
            src="/favicon.png"
            class="puzzle-image rounded me-2"
            alt="puzzle-img"
          />
          <div class="flex-fill d-flex flex-column justify-content-between">
            <div>
              <p class="fs-5 fw-semibold m-0">Level: {i + 1}</p>
              <p class="fs-6 text-secondary m-0">Answer: hehe</p>
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
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .puzzle-image {
    height: 5rem;
  }
</style>
