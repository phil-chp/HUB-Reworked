<template>
  <div class="note">
    <label>Hub</label>
    <span class="value">
      <strong>XP&nbsp;:&nbsp;{{ xp < 0 ? message : xp }}</strong>
      {{ fetchAttempts }}
      <a class="aid"></a>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Client from "@content_script/services/Client";
import DataHubActivities from "@shared/types/DataHubActivities";
import HubActivity from "@shared/types/HubActivity";

const xp = ref(-1);
const message = ref("Loading...");
const MAX_ATTEMPTS = 5;
const fetchAttempts = ref(MAX_ATTEMPTS);
const needUserInput = ref([]);


Client.getInstance().send("XP").then((res: DataHubActivities) => {
  console.log(`Attempt n${MAX_ATTEMPTS - fetchAttempts.value} `, res);
  if (res === undefined || res === null) {
    console.log(`Fetch failed, attempting again with ${500 * (MAX_ATTEMPTS - fetchAttempts.value)}ms delay`);
    setTimeout(async () => {
      await fetchXP();
    }, 500 * (MAX_ATTEMPTS - fetchAttempts.value));
    return;
  }
  if (res.activities.length > 0) {
    xp.value = calculateXP(res.activities);
    console.log("Need User input: ", needUserInput.value);
  }
});


const fetchXP = async () => {
  if (fetchAttempts.value > 0) {
    fetchAttempts.value--;
    xp.value = -1;
    console.log("Fetching XP...");
    await Client.getInstance().send("XP");
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
