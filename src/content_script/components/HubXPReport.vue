<template>
  <div class="xp-report">
    TOTOT
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import DataHubActivities from "../../shared/types/DataHubActivities";
import Communication from "../services/Communication";

console.log('[HUB Reworked] HubXPReport mounted');

Communication.sendRequest("XP").then((res: DataHubActivities) => {
  console.log("Received response: ", res);
});
</script>

<style scoped>
.xp-report {
  margin: 10px;
  font-size: inherit;
}
</style>
