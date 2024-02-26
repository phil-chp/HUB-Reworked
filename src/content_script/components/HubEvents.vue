<template>
  <div class="note">
    <label>Events</label>
    <a @click="toggle()" class="toggle-events"><span class="value">View HUB Events</span></a>
  </div>

  <div class="popup-events-wrapper" v-if="popupStatus" @click='() => { popupStatus = false }'>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Client from "@content_script/services/Client";
import { HUBEvent } from "@shared/types/HUBEvents";

const events = ref([] as HUBEvent[]);
const events_hint = ref("Loading...");
const MAX_ATTEMPTS = 5;
const fetchAttempts = ref(MAX_ATTEMPTS);

const popupStatus = ref(false);

onMounted(async () => {
  const res = await fetchEvents();
  console.log("Events: ", res.events);
  if (res.events.length > 0) {
    events.value = res.events;
  }
});

async function fetchEvents(): Promise<any> {
  while (true) {
    try {
      return await Client.getInstance().send("EVENTS");
    } catch (error: any) {
      if (fetchAttempts.value > 0) {
        --fetchAttempts.value;
        await mySleep(500 * (MAX_ATTEMPTS - fetchAttempts.value));
      } else {
        events_hint.value = "Error.";
        throw error;
      }
    }
  }
}

function toggle() {
  popupStatus.value = !popupStatus.value;
}

function mySleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
</script>

<style scoped>
.toggle-events {
  cursor: pointer;
  color: black;
  text-decoration: none;
}
.toggle-events:hover {
  text-decoration: underline;
}

.popup-events-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 2147483646;
  overflow-y: scroll;
}

.popup-events {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  max-width: 824px;
  max-height: 80%;
  gap: 24px;
  justify-content: space-between;
  z-index: 2147483647;
}

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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.8));
}

.card-header {
  position: absolute;
  top: 0;
  left: 0;
  margin: 16px;
  z-index: 3;
}

.card-header-title {
  font-size: 20px; /* Adjust based on your requirement */
  font-weight: bold;
  margin: 0;
  max-height: 4.8em; /* for 2 lines of text */
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
  font-size: 16px; /* Adjust based on your requirement */
  text-align: right;
  font-weight: bold;
}

.description {
  margin: 0;
  font-size: 14px;
  max-height: 4.8em;
  text-align: justify;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}




/* .card {
  position: relative;
  margin: 8px;
  width: 300px;
  height: 200px;
  background-color: white;
  border-radius: 5px;
  border: solid 1px black;
}

.card .link {
  text-decoration: none;
}

.card .card-image {
  width: 100%;
  height: 100px;
  overflow: hidden;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.card .card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card .card-info {
  position: relative;
  padding: 8px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card .card-info .card-header {
  position: absolute;
  top: 0;
  left: 0;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card .card-info .card-header .card-header-title {
  font-size: 1em;
  color: white;
}

.card .card-info .date {
  font-size: 0.8em;
  color: black;
}

.card .card-info .location {
  font-size: 0.8em;
  color: black;
}

.card .card-info .description {
  font-size: 0.8em;
  color: black;
} */
</style>
