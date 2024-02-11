import DataHubActivities from "@shared/types/DataHubActivities";

class Client {
  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public static getInstance(): Client {
    if (Client._instance === undefined) {
      Client._instance = new Client();
    }
    return Client._instance;
  }

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

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  private static _instance: Client;
  private _socket: chrome.runtime.Port;

  private constructor() {
    this._socket = chrome.runtime.connect();
  }
}

export default Client;
