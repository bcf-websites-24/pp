<script lang="ts">
  import LeaderboardItem from "$lib/components/admin/leaderboard-item.svelte";
  import { AdminUserDetails, AdminUserItem, make_date } from "$lib/helpers";
  import { admin_logged_in_state } from "$lib/stores";
  import { Modal } from "bootstrap";
  import { onMount } from "svelte";

  export let data: any;
  let details_elem: HTMLDivElement;
  let details_modal: Modal;
  let details = new AdminUserDetails();
  let user_items = new Array<AdminUserItem>();

  onMount((): void => {
    details_modal = new Modal(details_elem);
    $admin_logged_in_state = true;
    const leaderboard: Array<any> = data.leaderboard;

    if (leaderboard) {
      user_items = new Array<AdminUserItem>(leaderboard.length);

      for (let i = 0; i < leaderboard.length; ++i) {
        const details: AdminUserDetails = {
          username: leaderboard[i].f_username,
          student_id: leaderboard[i].f_student_id,
          email: leaderboard[i].f_email,
          shomobay_score: leaderboard[i].f_shomobay_score,
        };
        user_items[i] = {
          details: details,
          level: leaderboard[i].f_curr_level,
          attemps: leaderboard[i].f_total_submissions,
          last_submission: make_date(
            new Date(leaderboard[i].f_last_submission_time)
          ),
        };
      }
    }
  });
</script>

<div class="admin-page-root mx-auto mt-4 p-2">
  <p class="fs-3 fw-semibold text-center">Leaderboard</p>
  <div class="card card-body table-responsive border-0 shadow-sm">
    <table class=" table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Username</th>
          <th scope="col">Status</th>
          <th scope="col">Solved</th>
          <th scope="col">Attempts</th>
          <th scope="col">Last Submission</th>
        </tr>
      </thead>
      <tbody>
        {#each user_items as user, index}
          <LeaderboardItem {index} {user} modal={details_modal} bind:details />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<div
  bind:this={details_elem}
  class="modal fade"
  data-bs-backdrop="static"
  data-bs-keyboard="false"
  aria-hidden="true"
>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-body border-0">
        <div class="d-flex justify-content-between align-items-center">
          <p class="modal-title fs-4 m-0" id="staticBackdropLabel">Details</p>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="input-group my-1">
          <span class="detail-field input-group-text">Username</span>
          <input
            type="text"
            class="form-control shadow-none"
            value={details.username}
            readonly
          />
        </div>
        <div class="input-group my-1">
          <span class="detail-field input-group-text">Student ID</span>
          <input
            type="text"
            class="form-control shadow-none"
            value={details.student_id}
            readonly
          />
        </div>
        <div class="input-group my-1">
          <span class="detail-field input-group-text">Email</span>
          <input
            type="text"
            class="form-control shadow-none"
            value={details.email}
            readonly
          />
        </div>
        <div class="input-group my-1">
          <span class="detail-field input-group-text">Shomobay Score</span>
          <input
            type="text"
            class="form-control shadow-none"
            value={details.shomobay_score}
            readonly
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .detail-field {
    width: 10rem;
  }
</style>
