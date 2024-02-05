const API_PATH = "https://intra.epitech.eu/";
const API_SUFFIX = "/?format=json";

export default class EpitechAPI {
  private static instance: EpitechAPI;
  private userCookie: string;

  private constructor() {}

  public static getInstance() {
    if (!EpitechAPI.instance) {
      EpitechAPI.instance = new EpitechAPI();
    }
    return EpitechAPI.instance;
  }

  /**
   * Set the userCookie
   * @param userCookie
   */
  public setUserCookie(userCookie: string) {
    this.userCookie = userCookie;
  }

  /**
   * Fetch data from the Epitech API using the user cookie and a pre-defined URL
   * @param url The path to fetch (don't include any trailling or leading slashes)\
   * Example: for `https://intra.epitech.eu/user/?format=json` use `user`
   * @param warn Cause `console.error` in case of error.
   * @returns The fetched data or null if the fetch failed
   */
  public async fetchData(url: string, warn = true): Promise<any> | null {
    if (this.userCookie === undefined) {
      throw new Error("User cookie not set. Please call `EpitechAPI.setUserCookie()` first.");
    }
    const response = await fetch(API_PATH + url + API_SUFFIX, {
      headers: {
        Cookie: `user=${this.userCookie}`,
        Accept: "application/json",
      },
    });

    if (response.ok === false) {
      if (warn == true) {
        console.error(
          "Error fetching data:",
          response.status,
          response.statusText
        );
      }
      return null;
    }
    return response.json();
  }
}
