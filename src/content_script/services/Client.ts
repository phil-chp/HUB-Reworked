import DataHubActivities from "@shared/types/DataHubActivities";
import HubActivity from "@shared/types/HubActivity";
import { mySleep } from "@content_script/services/utils";

class Client {
  private _socket: chrome.runtime.Port;
  private _attemptedReconnect: number;

  constructor() {
    this._attemptedReconnect = 5;
  }

  public connect(timeout = 500): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._attemptedReconnect <= 0) {
        return reject(new Error("Failed to connect."));
      }
      this._socket = chrome.runtime.connect();
      const handler = () => {
        --this._attemptedReconnect;
        console.log(`Failed to connect. Retrying in ${timeout}ms... (${this._attemptedReconnect + 1} attempts left.)`)
        mySleep(timeout).then(() => this.connect(timeout * 2).then(resolve).catch(reject));
      };

      this._socket.onDisconnect.addListener(handler);
      this.send("TEST").then(() => {
        this._socket.onDisconnect.removeListener(handler);
        resolve();
      });
    });
  }

  public async fetchData(op: any, maxAttempts = 5): Promise<any> {
    if (this._socket === undefined) {
      throw new Error("Call connect() first.");
    }

    let attemptsLeft = maxAttempts;
    while (true) {
      try {
        const res = await this.send(op);
        if (res.d === undefined) {
          throw new Error("An error occured.");
        }
        return res;
      } catch (error: any) {
        console.log(`Error occured while fetching ${op} (Attempt ${maxAttempts - attemptsLeft + 1}/${maxAttempts})...`);
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

  public send(op: "GET_XP"): Promise<DataHubActivities>;

  public send(op: "UPDATE_XP", d: HubActivity[]): Promise<void>;

  public send(op: "RESET_XP"): Promise<void>;

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
