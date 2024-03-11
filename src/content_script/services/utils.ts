import { createApp } from "vue";

export function mySleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export enum Status {
  NONE,
  ERROR,
  SUCCESS,
  NEED_USER_INPUT,
}

export const mountAfter = (component: any, selector: string) => {
  const target = document.querySelector(selector);
  const parent = target.parentElement;
  const newTarget = document.createElement("div");
  parent.appendChild(newTarget);

  const app = createApp(component);
  app.mount(newTarget);
};
