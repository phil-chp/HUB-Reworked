import { HUBEvent } from "@shared/types/HUBEvents";

export type StudentCampus = {
  cityId: string;
  cityName: string;
  countryId: string;
  countryName: string;
  lat: number;
  lon: number;
};

abstract class Scrapper {
  protected _city: string;
  protected _country: string;
  protected _url: string;
  protected _options: any;
  protected _studentCampus: StudentCampus;
  protected _events: HUBEvent[];

  constructor(city: string, country: string, url?: string) {
    this._city = city;
    this._country = country;
    this._url = url;
    this._events = [];
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public async init() {
    const pathToCampusData = chrome.runtime.getURL("src/background/scrapper/res/campusData.json");
    this._studentCampus = await fetch(pathToCampusData)
      .then(async (response) => response.json())
      .then((campusData) => {
        return campusData.campuses.find((record: StudentCampus) => {
          return record.cityId === this._city && record.countryId === this._country;
        });
      });
    if (this._studentCampus === undefined) {
      throw new Error("Campus not found");
    }
    console.log(this._studentCampus);
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  protected abstract getLatestEvents(n: number): Promise<any>;
}

export default Scrapper;
