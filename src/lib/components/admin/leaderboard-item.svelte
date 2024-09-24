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
  <th
    style={`background-color: rgb(255, ${255.0 - user.details.shomobay_score * 127.5}, ${255.0 - user.details.shomobay_score * 127.5}); !important`}
    scope="row">{index + 1}</th
  >
  <td
    style={`background-color: rgb(255, ${255.0 - user.details.shomobay_score * 127.5}, ${255.0 - user.details.shomobay_score * 127.5}); !important`}
  >
    <div class="d-flex">
      <button
        on:click={toggle_details}
        class="btn btn-link link-dark link-underline-opacity-0 p-0 me-2"
        >{user.details.username}</button
      >
    </div>
  </td>
  <td
    style={`background-color: rgb(255, ${255.0 - user.details.shomobay_score * 127.5}, ${255.0 - user.details.shomobay_score * 127.5}); !important`}
    >{user.level}</td
  >
  <td
    style={`background-color: rgb(255, ${255.0 - user.details.shomobay_score * 127.5}, ${255.0 - user.details.shomobay_score * 127.5}); !important`}
    >{user.attemps}</td
  >
  <td
    style={`background-color: rgb(255, ${255.0 - user.details.shomobay_score * 127.5}, ${255.0 - user.details.shomobay_score * 127.5}); !important`}
    >{user.last_submission}</td
  >
</tr>
