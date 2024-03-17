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
      <div
        class="popup-details-wrapper"
        @click="() => { popupStatus = false }"
      >
        <table class="popup-details" @click.stop>
          <thead>
            <tr>
              <th>Activity</th>
              <th>XP</th>
              <th>Presences</th>
              <th>Absences</th>
            </tr>
          </thead>
          <tbody class="row" v-for="(event, index) in activities" :key="index" onerror="this.style.display='none'">
            <tr :class="{ 'organized': event.orgAbsences != 0 || event.orgPresences != 0 }">
              <td>{{ event.title }}</td>
              <td>{{ event.xp / (event.members || 1) }}</td>
              <td >{{ event.orgPresences == 0 ? event.presences : event.orgPresences }}</td>
              <td >{{ event.orgAbsences == 0 ? event.absences : event.orgAbsences }}</td>
            </tr>
          </tbody>
          <table class="popup-report" @click.stop>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Participated</th>
                <th>Organized</th>
              </tr>
            </thead>
            <tbody class="row" v-for="(value, key, index) in activityTypes" :key="index" onerror="this.style.display='none'">
              <tr>
                <td>{{ key }}</td>
                <td>{{ value[0] || 0 }}&nbsp;/&nbsp;{{ maxActivityTypes[key][0] || "∞" }}</td>
                <td>{{ value[1] || 0 }}&nbsp;/&nbsp;{{ maxActivityTypes[key][1] || "∞" }}</td>
              </tr>
            </tbody>
          </table>

          <div class="hub-legend">
            <div class="organized-legend"></div><div>Activity you organized</div>
          </div>

          <div class="hub-reset">
            <a @click="resetStats()">Reset all XP info?</a>
          </div>

        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
const activityTypes = ref({} as { string?: number[] });
const maxActivityTypes = {
              // part orga   // Sorry for this mess, I just want to get it work and don't really have the time. By the way, I've tried to setup children components for the tables as it's getting messy, but it doesn't work, so once again, I don't have the time right now
  "Talk":       [15,  6],
  "Workshop":   [10,  3],
  "Hackathon":  [0,   0],
  "Experience": [8,   0],
  "Project":    [0,   0],
} as { string?: number[] };

const needUserInput = ref([] as HubActivity[]);
const status = ref(Status.NONE);

const popupStatus = ref(false);

onMounted(async () => {
  await client.connect().catch(() => {
    console.log("An error occured while connecting to the background script. Please try reloading the page.")
    xp_hint.value = "Error.";
    status.value = Status.ERROR;
  });
  const res = await client.fetchData("GET_XP").catch(() => {
    xp_hint.value = "Error.";
    status.value = Status.ERROR;
  });
  // console.log("Activities: ", res.activities);

  if (res.activities?.length > 0) {
    activities.value = res.activities;
    xp.value = calculateXP(res.activities);
    activitiesReport();
    const needInput = await needUserInput.value;
    if (needInput.length > 0) {
      status.value = Status.NEED_USER_INPUT;
      // console.log("Need User input: ", needInput);
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
      const xpRaw = window.prompt(
        `How many XP did you obtain from ${activity.title}\n(Enter the total value, even if there are multiple members)`
      );
      let _xp = 0;

      if (xpRaw === "") {
        invalid = false;
      } else {
        try {
          _xp = parseInt(xpRaw);
        } catch (e) {
          alert("Invalid input, please enter a number.");
        }

        if (_xp > 0 && _xp <= 200) {
          // Don't ask lol
          activity.xp = _xp;
          xp.value += _xp / activity.members;
          invalid = false;
        } else {
          alert("Invalid input, please enter a real value.");
        }
      }
    }
  }

  const toSave: HubActivity[] = needUserInput.value.filter((item) => item.xp > 0) as HubActivity[];
  needUserInput.value = needUserInput.value.filter((item) => item.xp <= 0);
  if (toSave.length > 0) {
    status.value = Status.SUCCESS;
    client.send("UPDATE_XP", toSave);
  }
}

function viewDetails() {
  popupStatus.value = !popupStatus.value;
}

function resetStats() {
  client.send("RESET_XP");
  activities.value = [];
  xp.value = -1;
  status.value = Status.NONE;
  popupStatus.value = false;
  location.reload();
}

function activitiesReport() {
  for (const activity of activities.value) {
    const n = activity.orgPresences + activity.orgAbsences > 0 ? 1 : 0;
    if (activityTypes.value[activity.type]) {
      activityTypes.value[activity.type][n] += 1;
    } else {
      activityTypes.value[activity.type] = [];
      activityTypes.value[activity.type][n] = 1;
      activityTypes.value[activity.type][!n] = 0;
    }
  }
  return activityTypes;
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

.popup-details,
.popup-report {
  position: relative;
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  max-height: 80%;
  max-width: 60%;
  width: 100%;
  margin-bottom: 10px;
  overflow-y: auto;
  z-index: 2147483647;
}

.popup-report {
  margin: 32px 0;
  padding: 5px;
  width: 40%;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

.popup-details thead,
.popup-report thead {
  background-color: #f5f5f5;
}

.popup-details tr,
.popup-report tr {
  border-bottom: 1px solid #ddd;
}

.popup-details .hub-legend {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 16px 0;
}

.popup-details .hub-reset {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 16px;
}

.popup-details .hub-reset > a {
  cursor: pointer;
}

.popup-details .organized-legend::after,
.popup-details tr.organized > td:nth-child(1)::after {
  content: "*";
  color: red;
  font-size: 1.5em;
  margin: 0 5px;
}

.popup-details tr:last-child,
.popup-report tr:last-child {
  border-bottom: none;
}

.popup-details td,
.popup-report td {
  padding: 10px 0;
  text-align: center;
}

.popup-details th:first-child,
.popup-details td:first-child,
.popup-report th:first-child,
.popup-report td:first-child {
  text-align: left;
}

.popup-details tbody tr:hover,
.popup-report tbody tr:hover {
  background-color: #f5f5f5;
}
</style>
