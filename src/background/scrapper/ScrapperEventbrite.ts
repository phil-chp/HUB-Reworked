import Scrapper from "./Scrapper";
// import dotenv from "dotenv";

// dotenv.config();

class ScrapperEventbrite extends Scrapper {
  constructor(city: string, country: string) {
    super(city, country);
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  async getLatestEvents(n: number): Promise<any> {
    this._events = await this._fetch(n);
    console.log(this._events);
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  /**
   * Fetches the latest events from the Eventbrite API and returns them as a JSON object.
   * @returns {Promise<any>} The latest events from the Eventbrite API.
   */
  private async _fetch(n: number): Promise<any> {
    const events = await fetch('https://www.eventbrite.be/api/v3/destination/events/?event_ids=779884313977,799205403877,691657053867,770173709297,762855460217,762855319797,770172886837,762824798507,762826262887,762437590357,762732010977,762712552777,739925435897,837337598297,762970373927,762969902517,762930855727,762922681277,799920793627,794836024947&page_size=20&expand=event_sales_status,image,primary_venue,saves,ticket_availability,primary_organizer,public_collections')
      .then((res) => res.json())
      .then((res) => res.events)
      .catch((error) => console.error(error));

    return events;
  }
}

export default ScrapperEventbrite;
