import { epitech } from "./AsyncChromeAPI";
import User from "@shared/types/User";
import HubActivity from "@shared/types/HubActivity";
import HubActivityFactory from "@shared/types/HubActivityFactory";
import { RawHubActivity } from "@shared/types/RawHubActivity";

const API_PATH = "https://intra.epitech.eu/";
const API_SUFFIX = "/?format=json";

export default class Epitech {
  private userCookie: string;
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
    this.userCookie = await this._fetchCookie();
    this.userInfo = await this._fetchUserInfo();
  }

  /**
   * Fetch the hub activities from the Epitech API
   */
  public async fetchHubActivities(): Promise<void> {
    this.hubActivities = [];

    if (this.userInfo === undefined) {
      throw new Error("User info not found. Please call `Epitech.init` first.");
    }
    const { year, country, city } = this.userInfo;

    const city_response = await this._fetchData(`module/${year}/B-INN-000/${city}-0-1`);
    // const country_response = await this._fetchData(`module/${year}/B-INN-000/${country}-0-1`);

    if (city_response !== null) {
      const activities: RawHubActivity[] = city_response.activities;

      for (const activity of activities) {
        this.hubActivities.push(HubActivityFactory.createActivity(activity.type_title, activity));
      }
    }

    // if (country_response !== null) {
    //   console.log(city_response);
    // }
    console.log(this.hubActivities);
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
    const response = await this._fetchData("user");

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
      const response = await this._fetchData(`module/${year}/B-INN-000/${campus}-0-1`, false);
      if (response !== null) {
        correctCampus = campus;
        break;
      }
    }
    return correctCampus || "PAR";
  }

  /**
   * Fetch data from the Epitech API using the user cookie and a pre-defined URL
   * @param url The path to fetch (don't include any trailling or leading slashes)\
   * Example: for `https://intra.epitech.eu/user/?format=json` use `user`
   * @param warn Cause `console.error` in case of error.
   * @returns The fetched data or null if the fetch failed
   */
  private async _fetchData(url: string, warn = true): Promise<any> | null {
    const response = await fetch(API_PATH + url + API_SUFFIX, {
      headers: {
        Cookie: `user=${this.userCookie}`,
        Accept: "application/json",
      },
    });

    if (response.ok === false) {
      if (warn == true) {
        console.error("Error fetching data:", response.status, response.statusText);
      }
      return null;
    }
    return response.json();
  }
}
