import Scrapper from "./Scrapper";
import { HUBEvent } from "@shared/types/HUBEvents";
// import dotenv from "dotenv";

// dotenv.config();

class ScrapperMeetup extends Scrapper {

  constructor(city: string, country: string) {
    super(city, country);
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  async getLatestEvents(n: number): Promise<HUBEvent[]> {
    if (this._events.length > 0) { // TODO: Add expiration date
      return this._events;
    }
    const res = await this._fetch(n);

    for (const event of res) {
      this._events.push({
        title: event.node.title,
        description: event.node.description,
        date: new Date(event.node.dateTime).toLocaleString(),
        url: event.node.eventUrl,
        thumbnail: event.node.featuredEventPhoto?.highResUrl,
        venue: event.node.venue?.name,
        location: {
          lat: event.node.venue?.lat,
          lon: event.node.venue?.lon,
        }
      });
    }
    return this._events;
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  /**
   * Fetches the latest events from the Meetup API and returns them as a JSON object.
   * @returns {Promise<any>} The latest events from the Meetup API.
   */
  private async _fetch(n: number): Promise<any> {
    this._options = {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Origin: "https://www.meetup.com",
      },
      body: JSON.stringify({
        operationName: "recommendedEventsWithSeries",
        variables: {
          first: n,
          lat: this._studentCampus.lat,
          lon: this._studentCampus.lon,
          numberOfEventsForSeries: 5,
          sortField: "RELEVANCE",
          doConsolidateEvents: true,
          doPromotePaypalEvents: true,
          topicCategoryId: "546",
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: "6af218804f3fb79d0d3c4e8555be804bedee4b425ec1eec6b0479f5641f8b549",
          },
        },
      }),
    };

    // const city = `${this._studentCampus.countryId}--${this._studentCampus.cityName}`; // i.e. "be--Brussels"
    // return await fetch(`${this._url}?location=${city}&source=EVENTS&categoryId=546&sortField=RELEVANCE`)

    const res = await fetch('https://www.meetup.com/gql2', this._options)
      .then((res) => res.json())
      .then((res) => res.data?.result?.edges)
      .catch((error) => console.error(error));
    return res;
  }
}

export default ScrapperMeetup;
