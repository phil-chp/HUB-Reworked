/**
 * This is a very basic wrap some Chrome API features. The native methods use
 * callbacks, which require ugly wraps to use promises. I wanted to have a
 * simple async/await API to use in this project. So all the ugly stuff is
 * hidden below.
 *
 * @usage Example: `chrome.cookies.get()` becomes `epitech.cookies.get()`
 */
export namespace epitech {

  export namespace cookies {

    /**
     * Get a cookie by name asynchrounously
     * @param cookieName
     * @returns Cookie object
     */
    export function get(cookieName: string): Promise<chrome.cookies.Cookie | null> {
      return new Promise((resolve, reject) => {
        chrome.cookies.get(
          { url: "https://intra.epitech.eu/", name: "user" },
          (cookie) => {
            if (cookie) {
              resolve(cookie);
            } else {
              reject(new Error(`Cookie '${cookieName}' not found`));
            }
          }
        );
      });
    }

  }

  export namespace runtime {

    /**
     * Send a message
     * @param message
     */
    export function sendMessage(message: any, handler?: (response: any) => void): void {
      chrome.runtime.sendMessage(message, handler);
    }
  }

}
