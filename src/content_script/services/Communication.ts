import DataHubActivities from "@shared/types/DataHubActivities";
class Communication {
  private _socket: chrome.runtime.Port;

  constructor() {
    this._socket = chrome.runtime.connect();
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public sendRequest(op: "XP"): Promise<DataHubActivities>;

  public sendRequest(op: string, d: any = null): Promise<any> {
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
}

export default new Communication();
