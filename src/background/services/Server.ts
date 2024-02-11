import DataHubActivities from "@shared/types/DataHubActivities";
import Epitech from "@background/services/Epitech";

class Server {
  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public static getInstance(epi: Epitech): Server {
    if (Server._instance === undefined) {
      Server._instance = new Server(epi);
    }
    return Server._instance;
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  private static _instance: Server;
  private _epi: Epitech;

  private constructor(epi: Epitech) {
    this._epi = epi;
    this._openConnection();
  }

  private _openConnection() {
    chrome.runtime.onConnect.addListener((socket: chrome.runtime.Port) => {
      this._handleMessage(socket);
    });
  }

  private _handleMessage(socket: chrome.runtime.Port) {
    socket.onMessage.addListener(async (data: any) => {

      function respond(payload: any) {
        socket.postMessage({
          seq: data.seq,
          d: payload,
        });
      }

      switch (data.op) {
        case "XP":
          const activities = await this._epi.fetchHubActivities();
          const response: DataHubActivities = {
            d: Date.now(),
            activities,
          };

          return respond(response);
      }

    });
  }
}

export default Server;
