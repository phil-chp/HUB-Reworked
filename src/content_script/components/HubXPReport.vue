<template>
  <div class="note">
    <label>Hub</label>
    <span class="value xp-info">
      <strong>XP&nbsp;:&nbsp;{{ xp < 0 ? xp_hint : xp }}</strong>

      <div v-if="status == Status.NEED_USER_INPUT" @click="requestUserInput">
        <warn-icon class="icon-hub"></warn-icon>
      </div>
      <div v-if="status == Status.SUCCESS" @click="viewDetails">
        <info-icon class="icon-hub"></info-icon>
      </div>
      <div v-if="status == Status.ERROR">
        <error-icon class="icon-hub" hint-message="Rechargez la page."></error-icon>
      </div>

    </span>

    <div class="popup-details-anchor" v-if="popupStatus">
      <div class="popup-details-wrapper" @click='() => { popupStatus = false }'>
        <table class="popup-details" @click.stop>
          <thead>
            <tr>
              <th>Activity</th>
              <th>XP</th>
              <th>Presences</th>
              <th>Absences</th>
            </tr>
          </thead>
          <tbody class='row' v-for='(event, index) in activities' :key='index' onerror="this.style.display='none'">
            <tr>
              <td>{{ event.title }}</td>
              <td>{{ event.xp / (event.members || 1) }}</td>
              <td>{{ event.presences }}</td>
              <td>{{ event.absences }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Client from "@content_script/services/Client";
import HubActivity from "@shared/types/HubActivity";
import WarnIcon from "@content_script/assets/WarnIcon.vue";
import InfoIcon from "@content_script/assets/InfoIcon.vue";
import ErrorIcon from "@content_script/assets/ErrorIcon.vue";
import { Status } from "@content_script/services/utils";

let client = new Client();

const xp = ref(-1);
const xp_hint = ref("Loading...");
const activities = ref([] as HubActivity[]);

const needUserInput = ref([] as HubActivity[]);
const status = ref(Status.NONE);

const popupStatus = ref(false);

onMounted(async () => {
  const res = await client.fetchData("GET_XP").catch(() => {
    xp_hint.value = "Error.";
    status.value = Status.ERROR;
  })
  console.log("Activities: ", res.activities);

  if (res.activities?.length > 0) {
    activities.value = res.activities;
    xp.value = calculateXP(res.activities);
    const needInput = await needUserInput.value;
    if (needInput.length > 0) {
      status.value = Status.NEED_USER_INPUT;
      console.log("Need User input: ", needInput);
    } else {
      status.value = Status.SUCCESS;
    }
  }
});

const calculateXP = (activities: HubActivity[]) => {
  let xp = 0;
  for (const activity of activities) {
    if (activity.type === "Project" && activity.xp === 0) {
      needUserInput.value.push(activity);
    }
    xp += activity.xp / (activity.members || 1);
  }
  return xp;
};

function requestUserInput() {
  for (const activity of needUserInput.value) {
    let invalid = true;
    while (invalid) {
      const xpRaw = window.prompt(`How many XP did you obtain from ${activity.title}\n(Enter the total value, even if there are multiple members)`);
      let _xp = 0;

      if (xpRaw === "") {
        invalid = false;
      } else {
        try {
          _xp = parseInt(xpRaw);
        } catch (e) {
          alert("Invalid input, please enter a number.");
        }

        if (_xp > 0 && _xp <= 84) { // Don't ask lol
          activity.xp = _xp;
          xp.value += _xp / activity.members;
          invalid = false;
        } else {
          alert("Invalid input, please enter a real value.");
        }
      }
    }
  }

  const toSave: HubActivity[] = needUserInput.value.filter(item => item.xp > 0) as HubActivity[];
  needUserInput.value = needUserInput.value.filter(item => item.xp <= 0);
  if (toSave.length > 0) {
    client.send("UPDATE_XP", toSave);
  }
}

function viewDetails() {
  popupStatus.value = !popupStatus.value;
  console.log("View details clicked.", popupStatus.value);
}
</script>

<style scoped>
.xp-info {
  display: flex !important;
  align-items: center;
  gap: 5px;
}



.popup-details-anchor {
  position: fixed;
  inset: 0;
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2147483645;
}

.popup-details-wrapper {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  text-align: center;
  overflow-y: scroll;
  z-index: 2147483646;
}

.popup-details {
  position: relative;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  max-height: 80%;
  max-width: 80%;
  width: 100%; /* ? */
  border-collapse: collapse;
  margin-bottom: 10px;
  overflow-y: auto;
  z-index: 2147483647;
}

table tr {
  border-bottom: 1px solid #ddd;
}

table tr:last-child {
  border-bottom: none;
}

table td {
  padding: 10px 0;
  text-align: center;
}

table td:first-child {
  text-align: left;
}

table tr:hover {
  background-color: #f5f5f5;
}
</style>
