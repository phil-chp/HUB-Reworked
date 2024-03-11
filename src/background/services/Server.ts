import DataHubActivities from "@shared/types/DataHubActivities";
import Epitech from "@background/services/Epitech";
import DataEmptyReply from "@shared/types/DataEmptyReply";

class Server {
  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  private static _instance: Server;
  private _epi: Epitech;

  private constructor(epi?: Epitech) {
    if (epi !== undefined) {
      this._epi = epi;
    }
    this._openConnection();
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public static getInstance(epi?: Epitech): Server {
    if (Server._instance === undefined) {
      Server._instance = new Server(epi);
    }
    return Server._instance;
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

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

      // console.log("Received message:", data);
      switch (data.op) {
        case "TEST":
          // console.log("    Test");
          return respond(null);

        case "GET_XP":
          const activities = await this._epi.fetchHubActivities();
          // console.log("    Activities:", activities);
          return respond({
            d: Date.now(),
            activities,
          } as DataHubActivities);

        case "UPDATE_XP":
          this._epi.updateHubActivities(data.d);
          // console.log("    Updated XP");
          return respond({
            d: Date.now(),
          } as DataEmptyReply);

        case "RESET_XP":
          await this._epi.resetEvents();
          // console.log("    Reset events cache");
          return respond({
            d: Date.now(),
          }); // TODO: Rename HUBEvents to DataHUBEvents for consistency or vice-versa
      }
    });
  }
}

export default Server;
