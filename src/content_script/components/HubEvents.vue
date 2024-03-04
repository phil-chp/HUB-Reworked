<template>
  <div class="note">
    <label>Évenements</label>
    <span class="value event-info">
      <div>{{ events_hint }}</div>
      <div v-if="status == Status.SUCCESS" @click="toggle">
        <info-icon class="icon-hub"></info-icon>
      </div>
      <div v-if="status == Status.ERROR">
        <info-icon class="icon-hub" hint-message="Rechargez la page."></info-icon>
      </div>
    </span>
  </div>

  <div class="popup-events-anchor" v-if="popupStatus">
    <div class="popup-events-wrapper" @click='() => { popupStatus = false }'>
      <div class="popup-events" @click.stop>
        <div class='card' v-for='(event, index) in events' :key='index' onerror="this.style.display='none'">
          <a class="link" :href="event.url" target="_blank">
            <img :src='event.thumbnail' />
            <div class='card-info'>
              <div class='card-header'>
                <p class='card-header-title'>{{ event.title }}</p>
              </div>
              <div class='card-content'>
                <p class='date'>{{ event.date }}</p>
                <p class='location'>{{ event.venue }}</p>
                <p class='description'>{{ event.description }}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Client from "@content_script/services/Client";
import { HUBEvent } from "@shared/types/HUBEvents";
import InfoIcon from "@content_script/assets/InfoIcon.vue";
import ErrorIcon from "@content_script/assets/ErrorIcon.vue";
import { Status } from "@content_script/services/utils";

let client = new Client();

const events = ref([] as HUBEvent[]);
const events_hint = ref("Loading...");

const status = ref(Status.NONE);

const popupStatus = ref(false);

onMounted(async () => {
  const res = await client.fetchData("EVENTS").catch(() => {
    status.value = Status.ERROR;
    events_hint.value = "Erreur.";
  });
  // console.log("Events: ", res.events);

  if (res.events.length > 0) {
    status.value = Status.SUCCESS;
    events_hint.value = "View HUB Events";
    events.value = res.events;
  }
});

function toggle() {
  popupStatus.value = !popupStatus.value;
}

function mySleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
</script>

<style scoped>
.event-info {
  display: flex !important;
  align-items: center;
  gap: 5px;
}



.popup-events-anchor {
  position: fixed;
  inset: 0;
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2147483645;
}

.popup-events-wrapper {
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

.popup-events {
  position: relative;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  max-height: 80%;
  max-width: calc(400px * 2 + 24px);
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  margin-bottom: 10px;
  overflow-y: auto;
  z-index: 2147483647;
}

/* @media (max-width: 1247px) {
  .popup-events {
    max-width: 824px;
  }
}
@media (max-width: 823px) {
  .popup-events {
    max-width: 100%;
  }
} */

.card {
  position: relative;
  width: 400px;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  color: white;
  background-color: #333;
}

.card a {
  text-decoration: none;
  color: inherit;
}

.card img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.card-info {
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.4));
}

.card-header {
  position: absolute;
  top: 0;
  left: 0;
  margin: 16px;
  z-index: 3;
}

.card-header-title {
  font-size: 20px;
  text-align: left;
  font-weight: bold;
  margin: 0;
  max-height: 4.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  text-align: left;
  background-color: rgba(0, 0, 0, 0.5);
  width: calc(100% - 32px);
  padding: 16px;
  z-index: 3;
}

.date, .location {
  margin: 0;
  font-size: 16px;
  text-align: right;
  font-weight: bold;
}

.description {
  margin: 0;
  font-size: 14px;
  max-height: 4.8em;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
