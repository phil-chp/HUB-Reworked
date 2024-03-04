import dotenv from "dotenv";
import Epitech from "@background/services/Epitech";
import IntraAPI from "@shared/services/IntraAPI";

dotenv.config();
IntraAPI.getInstance().setUserCookie(process.env["USER_COOKIE"]);

describe("Background", () => {
  let epi: Epitech;

  beforeAll(async () => {
    epi = new Epitech();
    await epi.init();
  });

  test("Epitech::init", () => {
    const userInfo = epi.getUserInfo();
    expect(userInfo?.login).toBeDefined();
  });

  test("Epitech::fetchHubActivities", async () => {
    const activities = await epi.fetchHubActivities();
    expect(activities).toBeDefined();
    expect(activities.length).toBeGreaterThan(0);

    const activitiesStored = await epi.fetchHubActivities();
    expect(activitiesStored).toBeDefined();

    const activity = activities[0];
    activity.type = "Project";
    activity.xp = 9;
    await epi.updateHubActivities([activity]);
  }, 15000);

  test("Epitech::scrapeEvents", async () => {
    const events = await epi.scrapeEvents(1);
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });

  test("Epitech::init not called", async () => {
    const epiNotInit = new Epitech();
    expect(epiNotInit.fetchHubActivities()).rejects.toThrow(Error);
  });
});
