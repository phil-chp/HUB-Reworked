import DataHubActivities from "@shared/types/DataHubActivities";
import Epitech from "@background/services/Epitech";
import HUBEvents from "@shared/types/HUBEvents";
import DataEmptyReply from "@shared/types/DataEmptyReply";
import generateIdeas from "./GPT";
import DataIdeas from "@shared/types/Idea";

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

      console.log("Received message:", data);
      switch (data.op) {
        case "TEST":
          console.log("    Test");
          return respond(null);

        case "GET_XP":
          const activities = await this._epi.fetchHubActivities();
          console.log("    Activities:", activities);
          return respond({
            d: Date.now(),
            activities,
          } as DataHubActivities);

        case "UPDATE_XP":
          this._epi.updateHubActivities(data.d);
          console.log("    Updated XP");
          return respond({
            d: Date.now(),
          } as DataEmptyReply);

        case "EVENTS":
          const events = await this._epi.scrapeEvents(20);
          console.log("    Events:", events);
          return respond({
            d: Date.now(),
            events,
          } as HUBEvents); // TODO: Rename HUBEvents to DataHUBEvents for consistency or vice-versa

        case "RESET_XP":
          await this._epi.resetEvents();
          console.log("    Reset events cache");
          return respond({
            d: Date.now()
          }); // TODO: Rename HUBEvents to DataHUBEvents for consistency or vice-versa

        case "GENERATE_IDEAS":
          const response = await generateIdeas(data.d)
          console.log("    Generated ideas:", response);
          return respond({
            d: Date.now(),
            ideas: response,
          } as DataIdeas);

        // case "USER_INFO":
        //   const user = this._epi.getUserInfo();
        //   console.log("    User info:", user);
        //   return respond({
        //     d: Date.now(),
        //     user,
        //   } as DataUser);
      }
    });
  }
}

export default Server;
