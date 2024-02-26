import DataHubActivities from "@shared/types/DataHubActivities";
import HUBEvents from "@shared/types/HUBEvents";

class Client {
  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  private static _instance: Client;
  private _socket: chrome.runtime.Port;

  private constructor() {
    this._socket = chrome.runtime.connect();
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public static getInstance(): Client {
    if (Client._instance === undefined) {
      Client._instance = new Client();
    }
    return Client._instance;
  }

  public send(op: "EVENTS"): Promise<HUBEvents>;

  public send(op: "XP"): Promise<DataHubActivities>;

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
