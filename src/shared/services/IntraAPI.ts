const API_PATH = "https://intra.epitech.eu/";
const API_SUFFIX = "/?format=json";

export default class IntraAPI {
  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  private static _instance: IntraAPI;
  private _userCookie: string;

  private constructor() {}

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public static getInstance() {
    if (!IntraAPI._instance) {
      IntraAPI._instance = new IntraAPI();
    }
    return IntraAPI._instance;
  }

  /**
   * Searched for a cookie in the browser's cookies
   * @param cookieName
   */
  public async fetchUserCookie(cookieName: string) {
    await new Promise((resolve, reject) => {
      chrome.cookies.get({ url: "https://intra.epitech.eu/", name: cookieName }, (cookie) => {
        if (cookie) {
          resolve(cookie);
        } else {
          reject(new Error(`Cookie '${cookieName}' not found`));
        }
      });
    }).then((cookie: chrome.cookies.Cookie) => {
      this._userCookie = cookie.value;
    });
  }

  public setUserCookie(cookie: string) {
    this._userCookie = cookie;
  }

  /**
   * Fetch data from the Epitech API using the user cookie and a pre-defined URL
   * @param url The path to fetch (don't include any trailling or leading slashes)\
   * Example: for `https://intra.epitech.eu/user/?format=json` use `user`
   * @param warn Cause `console.error` in case of error.
   * @returns The fetched data or null if the fetch failed
   */
  public async fetch(url: string, warn = true): Promise<any> | null {
    let headers: any = {
      Accept: "application/json",
    };
    if (this._userCookie !== undefined) {
      headers.Cookie = `user=${this._userCookie}`;
    }
    const response = await fetch(API_PATH + url + API_SUFFIX, {
      headers: headers,
    });

    if (response.ok === false) {
      if (warn == true) {
        console.log("Error fetching data:", response.status, response.statusText);
      }
      return null;
    }
    return response.json();
  }

  public async fetchThrow(url: string): Promise<any> | null {
    let headers: any = {
      Accept: "application/json",
    };
    try {
      const response = await fetch(API_PATH + url + API_SUFFIX, {
        headers: headers,
      });
      if (response.ok === false) {
        return response;
      }
      return response.json();
    } catch (error) {
      throw new Error(error);
    }
  }
}
