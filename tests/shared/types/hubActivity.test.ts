import HubTalk from "@shared/types/hubActivities/HubTalk";
import HubWorkshop from "@shared/types/hubActivities/HubWorkshop";
import RawHubActivity from "@shared/types/RawHubActivity";
import HubHackathon from "@shared/types/hubActivities/HubHackathon";

const MOCK_RAW_HUB_ACTIVITY = {
  codeacti: "acti-XXXXXX",
  title: "Lorem Ipsum",
  description: "Lorem Ipsum dolor sit amet.",
  type_title: "Project",
  events: [],
  end: "2100-01-01 23:42:00",
} as RawHubActivity;

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
});
