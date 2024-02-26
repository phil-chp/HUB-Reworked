import { createApp } from "vue";
import HubXPReport from "@content_script/components/HubXPReport.vue";
import HubEvents from "@content_script/components/HubEvents.vue";

const mountAfter = (component: any, selector: string) => {
  const target = document.querySelector(selector);
  const parent = target.parentElement;
  const newTarget = document.createElement("div");
  parent.appendChild(newTarget);

  const app = createApp(component);
  app.mount(newTarget);
};

mountAfter(HubXPReport, "#profil .rzone span.note");
mountAfter(HubEvents, "#profil .rzone span.note");
