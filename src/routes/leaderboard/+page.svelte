<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  class Stat {
    public username = "";
    public current_level = -1;
    public batch = "";
  }

  let players = new Array<Stat>();

  onMount((): void => {
    fetch("/api/arena/leaderboard", {
      method: "POST",
      body: "",
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        const response_json = (await response.json()) as Array<any>;
        players = new Array<Stat>(response_json.length);

        for (let i = 0; i < response_json.length; ++i) {
          players[i] = {
            username: response_json[i].f_username,
            current_level: response_json[i].f_curr_level,
            batch: (response_json[i].f_student_id as string).substring(0, 4),
          };
        }
      } else if (response.status === 403) {
        goto("/");
      }
    });
  });
</script>

<div class="page-root mx-auto mt-4 p-2">
  <p class="fs-3 fw-semibold text-center">Leaderboard</p>
  <div class="card card-body border-0 shadow-sm">
    <table class="table p-2 m-0">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Username</th>
          <th scope="col">Batch</th>
          <th scope="col">Level</th>
        </tr>
      </thead>
      <tbody>
        {#each players as player, i}
          <tr>
            <th scope="row">{i + 1}</th>
            <td>{player.username}</td>
            <td>{player.batch}</td>
            <td>{player.current_level}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
