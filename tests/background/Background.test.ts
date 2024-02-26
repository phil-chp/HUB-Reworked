import Epitech from "@background/services/Epitech";
import IntraAPI from "@shared/services/IntraAPI";

import Server from "@background/services/Server";
import Client from "@content_script/services/Client";
import DataHubActivities from "@shared/types/DataHubActivities";

describe("Background", () => {
  let epi: Epitech;

  beforeAll(async () => {
    await IntraAPI.getInstance().fetchUserCookie("user");
    epi = new Epitech();
    await epi.init();
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

  test("Data transfer between Server and Client via Epitech", async () => {
    await Server.getInstance(epi);
    await Client.getInstance().send("XP");
    //   .then((res: DataHubActivities) => {
    //     expect(res).toBeDefined();
    //     expect(res.activities).toBeDefined();
    //     expect(res.activities.length).toBeGreaterThan(0);
    //   });
  });
});
