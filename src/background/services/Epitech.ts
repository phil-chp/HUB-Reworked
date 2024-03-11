import pLimit from "p-limit";

import IntraAPI from "@shared/services/IntraAPI";
import User from "@shared/types/User";
import HubActivity from "@shared/types/HubActivity";
import HubActivityFactory from "@shared/types/HubActivityFactory";
import RawHubActivity from "@shared/types/RawHubActivity";

const LIMIT = pLimit(20);

export default class Epitech {
  private _LS: chrome.storage.LocalStorageArea;

  private _userInfo: User;
  private _hubActivities: HubActivity[];

  constructor() {
    this._LS = chrome.storage.local;
    // this._LS.clear();
    this._hubActivities = [];
  }

  // *----------------------------------------------------------------------* //
  // *                               Public                                 * //
  // *----------------------------------------------------------------------* //

  /**
   * Initialize the Epitech service fetching the user
   * cookie and the user info necessary for later.
   */
  public async init(): Promise<void> {
    this._userInfo = await this._fetchUserInfo();
  }

  /**
   * Get the user info
   * @returns The user info
   */
  public getUserInfo(): User {
    return this._userInfo;
  }

  public resetEvents() {
    this._LS.remove("hubActivitiesHash");
  }

  /**
   * Fetch the hub activities from the Epitech API
   */
  public async fetchHubActivities(): Promise<HubActivity[]> {
    if (this._userInfo === undefined) {
      throw new Error("User info not found. Please call `Epitech.init()` first.");
    }
    const { hubActivitiesHash } = await this._LS.get("hubActivitiesHash");
    const hubActivitiesRecord: Record<string, HubActivity> = hubActivitiesHash || {};
    this._hubActivities = Object.values(hubActivitiesRecord);

    if (this._hubActivities.length > 0) {
      return this._hubActivities;
    }
    // const hasExpired = this._LS.get("exipresIn", (res) => {
    //   return (res.exipresIn !== undefined && res.exipresIn > Date.now());
    // });

    const { year, country, city } = this._userInfo;

    await this._fetchHubRegionalActivities(year, city);
    await this._fetchHubRegionalActivities(year, country);
    await this._updateActivitiesHash(this._hubActivities);

    // this._LS.set({ exipresIn: Date.now() + 1000 * 60 * 60 * 24 }); // TODO: Beta test this timer
    return this._hubActivities;
  }

  public async updateHubActivities(activities: HubActivity[]) {
    await this._updateActivitiesHash(activities);
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  private async _updateActivitiesHash(activities: HubActivity[]) {
    const { hubActivitiesHash } = await this._LS.get("hubActivitiesHash");
    const hubActivitiesRecord: Record<string, HubActivity> = hubActivitiesHash || {};

    for (const activity of activities) {
      const savedActivity = hubActivitiesRecord[activity.codeacti];
      if (
        savedActivity !== undefined &&
        (savedActivity.type === "Project" || savedActivity.type === "Experience") &&
        savedActivity.xp !== 0
      ) {
        hubActivitiesRecord[activity.codeacti] = activity;
        hubActivitiesRecord[activity.codeacti].xp = savedActivity.xp;
      } else {
        hubActivitiesRecord[activity.codeacti] = activity;
      }
    }
    await this._LS.set({ hubActivitiesHash: hubActivitiesRecord });
  }

  /**
   * Fetch and determine the user info from the Epitech API
   * @returns The user info
   */
  private async _fetchUserInfo(): Promise<User> {
    const response = await IntraAPI.getInstance().fetch("user");
    if (response === null) throw new Error("Failed to fetch user info");

    let [country, city] = response.location.split("/");
    if (response.semester >= 7 && city === "PAR") {
      city = await this._determineCampus(response.scolaryear);
    }
    return {
      login: response.login,
      year: response.scolaryear,
      semester: response.semester,
      country: country,
      city: city,
    };
  }

  /**
   * Yeah 4th+ year students are assigned to Paris that also includes Euro campuses
   * It's a pain in the ass as the Hub modules are hardcoded as the correct city
   * but everything else is related to FR/PAR, we literally have to bruteforce
   * all euro campuses. I didn't find any easier way to do this.
   */
  private async _determineCampus(year: string): Promise<string> {
    const euroCampuses = ["PAR", "BRU", "BER", "BAR"];
    let correctCampus: string = null;

    for (const campus of euroCampuses) {
      // TODO Change these to "HEAD" requests
      try {
        const response = await IntraAPI.getInstance().fetch(`module/${year}/B-INN-000/${campus}-0-1`, false);
        if (response !== null) {
          correctCampus = campus;
          break;
        }
      } catch (_) {
        continue;
      }
    }
    return correctCampus || "PAR";
  }

  private async _fetchHubRegionalActivities(year: string, region: string) {
    const response = await IntraAPI.getInstance().fetch(`module/${year}/B-INN-000/${region}-0-1`);

    if (response === null) return;
    const activities: RawHubActivity[] = response.activites;

    const activityPromises = activities.map((activity) => {
      return LIMIT(async () => {
        const hubActivity = HubActivityFactory.createActivity(activity.type_title, activity, this._userInfo, region);
        if (hubActivity !== null) {
          return (await hubActivity.init()) ? hubActivity : null;
        }
        return null;
      });
    });

    await Promise.all(activityPromises).then((activities) => {
      const validActivities = activities.filter(
        (activity) => activity !== null && (activity.presences > 0 || activity.absences > 0)
      );
      this._hubActivities.push(...validActivities);
    });
  }
}
