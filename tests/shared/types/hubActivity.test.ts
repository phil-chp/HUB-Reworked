import HubActivity from "@shared/types/HubActivity";
import HubTalk from "@shared/types/hubActivities/HubTalk";
import HubWorkshop from "@shared/types/hubActivities/HubWorkshop";
import RawHubActivity from "@shared/types/RawHubActivity";
import HubHackathon from "@shared/types/hubActivities/HubHackathon";
// import HubProject from "@shared/types/hubActivities/HubProject";
// import HubExperience from "@shared/types/hubActivities/HubExperience";
import User from '@shared/types/User';

const MOCK_RAW_HUB_ACTIVITY = {
  codeacti: "acti-XXXXXX",
  title: "Lorem Ipsum",
  description: "Lorem Ipsum dolor sit amet.",
  type_title: "Project",
  events: [],
  end: "2100-01-01 23:42:00",
} as RawHubActivity;

const MOCK_USER_DATA = {
  login: "mock.user@epitech.eu",
  year: 2023,
  semester: 7,
  country: "FR",
  city: "PAR",
} as User;

describe("Communication", () => {
  test("HubTalk: no event", async () => {
    const activity = new HubTalk(MOCK_RAW_HUB_ACTIVITY);
    expect(activity).toBeDefined();
    expect(await activity.init()).toBe(false);
  });

  test("HubTalk: absent", async () => {
    const rawHubActivity = {
      ...MOCK_RAW_HUB_ACTIVITY,
      events: [
        {
          user_status: "absent",
        },
      ],
    } as RawHubActivity;

    const activity = new HubTalk(rawHubActivity);
    expect(activity).toBeDefined();
    expect(await activity.init()).toBe(true);
    expect(activity.xp).toBe(-1);
  });

  test("HubWorkshop: no event", async () => {
    const activity = new HubWorkshop(MOCK_RAW_HUB_ACTIVITY);
    expect(activity).toBeDefined();
    expect(await activity.init()).toBe(false);
  });

  test("HubWorkshop: absent", async () => {
    const rawHubActivity = {
      ...MOCK_RAW_HUB_ACTIVITY,
      events: [
        {
          user_status: "absent",
        },
      ],
    } as RawHubActivity;

    const activity = new HubWorkshop(rawHubActivity);
    expect(activity).toBeDefined();
    expect(await activity.init()).toBe(true);
    expect(activity.xp).toBe(-2);
  });

  test("HubHackathon: no event", async () => {
    const activity = new HubHackathon(MOCK_RAW_HUB_ACTIVITY);
    expect(activity).toBeDefined();
    expect(await activity.init()).toBe(false);
  });

  test("HubHackathon: absent", async () => {
    const rawHubActivity = {
      ...MOCK_RAW_HUB_ACTIVITY,
      events: [
        {
          user_status: "absent",
        },
      ],
    } as RawHubActivity;

    const activity = new HubHackathon(rawHubActivity);
    expect(activity).toBeDefined();
    expect(await activity.init()).toBe(true);
    expect(activity.xp).toBe(-6);
  });

  // test("HubProject: absent", async () => {
  //   const activity = new HubProject(MOCK_RAW_HUB_ACTIVITY, MOCK_USER_DATA, "XXX");
  //   expect(activity).toBeDefined();
  //   expect(await activity.init()).toBe(false);
  // });

  // test("HubExperience: absent", async () => {
  //   const activity = new HubExperience(MOCK_RAW_HUB_ACTIVITY, MOCK_USER_DATA, "XXX");
  //   expect(activity).toBeDefined();
  //   expect(await activity.init()).toBe(false);
  // });
});
