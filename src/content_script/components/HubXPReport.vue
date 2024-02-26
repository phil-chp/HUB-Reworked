<template>
  <div class="note">
    <label>Hub</label>
    <span class="value">
      <strong>XP&nbsp;:&nbsp;{{ xp < 0 ? xp_hint : xp }}</strong>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Client from "@content_script/services/Client";
import DataHubActivities from "@shared/types/DataHubActivities";
import HubActivity from "@shared/types/HubActivity";

const xp = ref(-1);
const xp_hint = ref("Loading...");
const MAX_ATTEMPTS = 5;
const fetchAttempts = ref(MAX_ATTEMPTS);
const needUserInput = ref([]);

onMounted(async () => {
  const res = await fetchXP();

  if (res.activities.length > 0) {
    xp.value = calculateXP(res.activities);
    console.log("Need User input: ", needUserInput.value);
  }
});

// Client.getInstance().send("XP").then((res: DataHubActivities) => {
//   console.log(`Attempt ${MAX_ATTEMPTS - fetchAttempts.value}: `, res);
//   // if (res === undefined || res === null) {
//   //   console.warn(`[Hub Reworked] Fetch failed, attempting again with ${500 * (MAX_ATTEMPTS - fetchAttempts.value)}ms delay`);
//   //   setTimeout(async () => {
//   //     await ;
//   //   }, 500 * (MAX_ATTEMPTS - fetchAttempts.value));
//   //   return;
//   // }
// });

async function fetchXP(): Promise<any> {
  while (true) {
    try {
      return await Client.getInstance().send("XP");
    } catch (error: any) {
      if (fetchAttempts.value > 0) {
        --fetchAttempts.value;
        await mySleep(500 * (MAX_ATTEMPTS - fetchAttempts.value));
      } else {
        xp_hint.value = "Error.";
        throw error;
      }
    }
  }
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

function mySleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
</script>
