<script lang="ts">
  import type { AdminUserDetails, AdminUserItem } from "$lib/helpers";
  import { Modal } from "bootstrap";

  export let index: number;
  export let user: AdminUserItem;
  export let modal: Modal;
  export let details: AdminUserDetails;

  function toggle_details(): void {
    details = user.details;

    modal.toggle();
  }
</script>

<tr>
  <th scope="row">{index + 1}</th>
  <td>
    <div class="d-flex">
      <button
        on:click={toggle_details}
        class="btn btn-link link-dark link-underline-opacity-0 p-0 me-2"
        >{user.details.username}</button
      >
    </div>
  </td>
  <td></td>
  <td>{user.level}</td>
  <td>{user.attemps}</td>
  <td>{user.last_submission}</td>
</tr>
