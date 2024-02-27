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
  }, 15000);

});
