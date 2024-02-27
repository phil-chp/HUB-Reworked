import pLimit from "p-limit";

import IntraAPI from "@shared/services/IntraAPI";
import User from "@shared/types/User";
import HubActivity from "@shared/types/HubActivity";
import HubActivityFactory from "@shared/types/HubActivityFactory";
import RawHubActivity from "@shared/types/RawHubActivity";
import ScrapperMeetup from "@background/scrapper/ScrapperMeetup";

const LIMIT = pLimit(20);

export default class Epitech {
  private _LS: chrome.storage.LocalStorageArea;
  toto: boolean;

  private _userInfo: User;
  private _scrapperMeetup: ScrapperMeetup;
  private _hubActivities: HubActivity[];

  constructor() {
    this._LS = chrome.storage.local;
    // this._LS.clear();
    this._hubActivities = [];
    this.toto = true;
  }

  // *----------------------------------------------------------------------* //
  // *                               Public                                 * //
  // *----------------------------------------------------------------------* //

  /**
   * Initialize the Epitech service fetching the user
   * cookie and the user info necessary for later.
   */
  public async init(): Promise<void> {
    const _exipresIn = await this._LS.get("exipresIn");
    const _hubActivities = await this._LS.get("hubActivities");
    const _hubActivitiesHash = await this._LS.get("hubActivitiesHash");
    console.log(_exipresIn, _hubActivities, _hubActivitiesHash);
    this._userInfo = await this._fetchUserInfo();
    this._scrapperMeetup = new ScrapperMeetup(this._userInfo.city, this._userInfo.country);
    this._scrapperMeetup.init();
  }

  /**
   * Get the user info
   * @returns The user info
   */
  public getUserInfo(): User {
    return this._userInfo;
  }

  public scrapeEvents(n: number) {
    return this._scrapperMeetup.getLatestEvents(n);
  }

  /**
   * Fetch the hub activities from the Epitech API
   */
  public async fetchHubActivities(): Promise<HubActivity[]> {
    if (this._userInfo === undefined) {
      throw new Error("User info not found. Please call `Epitech.init()` first.");
    }
    if (this._hubActivities.length > 0) {
      return this._hubActivities;
    }
    // const hasExpired = this._LS.get("exipresIn", (res) => {
    //   return (res.exipresIn !== undefined && res.exipresIn > Date.now());
    // });
    const data = await new Promise((resolve) => {
      this._LS.get("hubActivities", (res) => {
        if (res.hubActivities !== undefined) {
          resolve(res.hubActivities);
        }
        resolve(undefined);
      });
    }).catch(() => undefined);

    if (data !== undefined) {
      this._hubActivities = data as HubActivity[];
      return this._hubActivities;
    }

    // this._userInfo.year = "2022"; // FIXME: REMOVE
    // this._userInfo.city = "NCE";  // FIXME: REMOVE
    const { year, country, city } = this._userInfo;

    await this._fetchHubRegionalActivities(year, city);
    await this._fetchHubRegionalActivities(year, country);

    await this._updateActivitiesHash(this._hubActivities);

    // this._LS.set({ exipresIn: Date.now() + 1000 * 60 * 60 * 24 }); // TODO: Beta test this timer
    return this._hubActivities;
  }

  public async updateHubActivities(activities: HubActivity[]) {
    this.toto = false;
    await this._updateActivitiesHash(activities);
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  private async _updateActivitiesHash(activities: HubActivity[]) {
    console.log("Updating hash map with: ", activities);

    const hubActivitiesHash = await this._LS.get("hubActivitiesHash")|| {};
    console.log("HASH MAP Before update: ", hubActivitiesHash);
    if (!this.toto) return;
    for (const activity of activities) {
      if (
        hubActivitiesHash[activity.codeacti] !== undefined &&
        (hubActivitiesHash[activity.codeacti].type === "Project" ||
          hubActivitiesHash[activity.codeacti].type === "Experience")
      ) {
        const grade = hubActivitiesHash[activity.codeacti].grade;
        hubActivitiesHash[activity.codeacti] = activity;
        if (grade !== 0) hubActivitiesHash[activity.codeacti].grade = grade;
      } else {
        hubActivitiesHash[activity.codeacti] = activity;
      }
    }
    // await this._LS.remove("hubActivitiesHash");
    await this._LS.set({ hubActivitiesHash });

    const res = await this._LS.get('hubActivitiesHash');
    console.log("HASH MAP After update: ", res);
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
      const response = await IntraAPI.getInstance().fetch(`module/${year}/B-INN-000/${campus}-0-1`, false);
      if (response !== null) {
        correctCampus = campus;
        break;
      }
    }
    return correctCampus || "PAR";
  }

  private async _fetchHubRegionalActivities(year: string, region: string) {
    const response = await IntraAPI.getInstance().fetch(`module/${year}/B-INN-000/${region}-0-1`);

    if (response === null) return;
    const activities: RawHubActivity[] = response.activites; //.slice(200, 500);

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
