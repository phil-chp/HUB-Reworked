import DataHubActivities from "@shared/types/DataHubActivities";
import HUBEvents from "@shared/types/HUBEvents";
import HubActivity from "@shared/types/HubActivity";
import { mySleep } from "@content_script/services/utils";

class Client {
  private _socket: chrome.runtime.Port;

  constructor() {
    this._socket = chrome.runtime.connect();
  }

  public async fetchData(op: any, maxAttempts = 5): Promise<any> {
    let attemptsLeft = maxAttempts;
    while (true) {
      try {
        const res = await this.send(op);
        if (res.d === undefined) {
          throw new Error("An error occured.");
        }
        return res;
      } catch (error: any) {
        console.warn(`Error occured while fetching ${op} (Attempt ${maxAttempts - attemptsLeft + 1}/${maxAttempts})...`);
        if (attemptsLeft >= 0) {
          --attemptsLeft;
          await mySleep(500 * (maxAttempts - attemptsLeft));
        } else {
          throw error;
        }
      }
    }
  }

  public send(op: "TEST"): Promise<any>;

  public send(op: "EVENTS"): Promise<HUBEvents>;

  public send(op: "GET_XP"): Promise<DataHubActivities>;

  public send(op: "UPDATE_XP", d: HubActivity[]): Promise<void>;

  // public send(op: "USER_INFO"): Promise<DataUser>;

  public send(op: string, d: any = null): Promise<any> {
    return new Promise((resolve) => {
      const seq = Date.now();
      const hook = (data: any) => {
        if (data.seq === seq) {
          this._socket.onMessage.removeListener(hook);
          resolve(data.d);
        }
      };

      this._socket.onMessage.addListener(hook);
      return this._socket.postMessage({ op, seq, d });
    });
  }
}

export default Client;
