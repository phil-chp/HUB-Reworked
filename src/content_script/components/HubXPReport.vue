<template>
  <div class="note">
    <label>Hub</label>
    <span class="value">
      <strong>XP&nbsp;:&nbsp;{{ xp < 0 ? message : xp }}</strong>
      <a class="aid"></a>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Communication from "@content_script/services/Communication";
import DataHubActivities from "@shared/types/DataHubActivities";
import HubActivity from "@shared/types/HubActivity";

const xp = ref(-1);
const message = ref("Loading...");
const fetchAttempts = ref(3);
const needUserInput = ref([]);


Communication.sendRequest("XP").then((res: DataHubActivities) => {
  if (res === undefined || res === null) fetchXP();
  xp.value = calculateXP(res.activities);
  console.log("Need User input: ", needUserInput.value);
});


const fetchXP = () => {
  fetchAttempts.value--;
  if (fetchAttempts.value > 0) {
    xp.value = -1;
    Communication.sendRequest("XP");
  }
  message.value = "Error.";
  return;
}


const calculateXP = (activities: HubActivity[]) => {
  let xp = 0;
  for (const activity of activities) {
    if (activity.type === "Project" && activity.xp === 0) {
      needUserInput.value.push(activity); // TODO: Add a way to display this to the user
    }
    xp += activity.xp;
  }
  return xp;
};
</script>
