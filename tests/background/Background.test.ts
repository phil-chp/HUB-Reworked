import dotenv from "dotenv";
import Epitech from "@background/services/Epitech";

import Server from "@background/services/Server";
// import Client from "@content_script/services/Client";
// import DataHubActivities from "@shared/types/DataHubActivities";
// import { HUBEvent } from "@shared/types/HUBEvents";
import IntraAPI from "@shared/services/IntraAPI";

dotenv.config();
IntraAPI.getInstance().setUserCookie(process.env["USER_COOKIE"]);

describe("Background", () => {
  let epi: Epitech;

  beforeAll(async () => {
    epi = new Epitech();
    await epi.init();
    Server.getInstance(epi);
  });

  test("Epitech init", async () => {
    const userInfo = epi.getUserInfo();
    expect(userInfo?.login).toBeDefined();
  });

  // test("Epitech::fetchHubActivities", async () => {
  //     const activities = await epi.fetchHubActivities();
  //     expect(activities).toBeDefined();
  //     expect(activities.length).toBeGreaterThan(0);
  // }, 15000);

  // test("Data transfer between Server and Client via Epitech", async () => {
  //   await Server.getInstance(epi);
  //   await Client.getInstance().send("XP");
  //   //   .then((res: DataHubActivities) => {
  //   //     expect(res).toBeDefined();
  //   //     expect(res.activities).toBeDefined();
  //   //     expect(res.activities.length).toBeGreaterThan(0);
  //   //   });
  // });
});
