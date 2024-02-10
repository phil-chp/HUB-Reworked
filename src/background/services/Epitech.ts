import pLimit from "p-limit";

import { epitech } from "./AsyncChromeAPI";
import EpitechAPI from "@shared/services/EpitechAPI";
import User from "@shared/types/User";
import HubActivity from "@shared/types/HubActivity";
import HubActivityFactory from "@shared/types/HubActivityFactory";
import RawHubActivity from "@shared/types/RawHubActivity";

const LIMIT = pLimit(20);

export default class Epitech {
  private userInfo: User;

  private hubActivities: HubActivity[];

  // *----------------------------------------------------------------------* //
  // *                               Public                                 * //
  // *----------------------------------------------------------------------* //

  /**
   * Initialize the Epitech service fetching the user
   * cookie and the user info necessary for later.
   */
  public async init(): Promise<void> {
    // const userCookie = await this._fetchCookie();
    // EpitechAPI.getInstance().setUserCookie(userCookie);
    this.userInfo = await this._fetchUserInfo();
  }

  /**
   * Fetch the hub activities from the Epitech API
   */
  public async fetchHubActivities(): Promise<HubActivity[]> {
    this.hubActivities = [];

    if (this.userInfo === undefined) {
      throw new Error("User info not found. Please call `Epitech.init()` first.");
    }
    // this.userInfo.year = "2022"; // FIXME: REMOVE
    // this.userInfo.city = "NCE";  // FIXME: REMOVE
    const { year, country, city } = this.userInfo;

    await this._fetchHubRegionalActivities(year, city);
    await this._fetchHubRegionalActivities(year, country);
    console.log("Hub Activities: ", this.hubActivities);
    return this.hubActivities;
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  /**
   * Fetch the user cookie from the Chrome API
   * @returns The user cookie
   */
  private async _fetchCookie(): Promise<string> {
    const cookie = await epitech.cookies.get("user");

    if (cookie === null) {
      throw new Error("Cookie 'user' not found");
    }
    return cookie.value;
  }

  /**
   * Fetch and determine the user info from the Epitech API
   * @returns The user info
   */
  private async _fetchUserInfo(): Promise<User> {
    // TODO: Ask client for this info in case they have stored it
    const response = await EpitechAPI.getInstance().fetchData("user");

    if (response === null) {
      throw new Error("Failed to fetch user info");
    }

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
      const response = await EpitechAPI.getInstance().fetchData(`module/${year}/B-INN-000/${campus}-0-1`, false);
      if (response !== null) {
        correctCampus = campus;
        break;
      }
    }
    return correctCampus || "PAR";
  }

  private async _fetchHubRegionalActivities(year: string, region: string) {
    const response = await EpitechAPI.getInstance().fetchData(`module/${year}/B-INN-000/${region}-0-1`);

    if (response === null) return;
    const activities: RawHubActivity[] = response.activites;

    const activityPromises = activities.map((activity) => {
      return LIMIT(async () => {
        const hubActivity = HubActivityFactory.createActivity(activity.type_title, activity, this.userInfo, region);
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
      this.hubActivities.push(...validActivities);
    });
  }
}
