<template>
  <div class="note">
    <label>Hub</label>
    <span class="value xp-info">
      <strong>XP&nbsp;:&nbsp;{{ xp < 0 ? xp_hint : xp }}</strong>
      <warn-icon
        v-if="needUserInput.length > 0"
        class="warn-icon-hub"
        @click="requestUserInput()"
      ></warn-icon>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Client from "@content_script/services/Client";
import HubActivity from "@shared/types/HubActivity";
import WarnIcon from "@content_script/assets/WarnIcon.vue";

const xp = ref(-1);
const xp_hint = ref("Loading...");

const MAX_ATTEMPTS = 5;
const fetchAttempts = ref(MAX_ATTEMPTS);

const needUserInput = ref([] as HubActivity[]);

onMounted(async () => {
  const res = await fetchXP();

  if (res.activities.length > 0) {
    xp.value = calculateXP(res.activities);
    const needInput = await needUserInput.value;
    console.log("Need User input: ", needInput);
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
      return await Client.getInstance().send("GET_XP");
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
      needUserInput.value.push(activity);
    }
    xp += activity.xp;
  }
  return xp;
};

function mySleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

        if (_xp > 0 && _xp <= 84) {
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

  console.log(toSave);

  Client.getInstance().send("UPDATE_XP", toSave);
}
</script>

<style scoped>
.xp-info {
  display: flex !important;
  align-items: center;
  gap: 5px;
}

.warn-icon-hub {
  cursor: pointer;
}
</style>
