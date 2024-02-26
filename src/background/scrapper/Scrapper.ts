import { HUBEvent } from "@shared/types/HUBEvents";
import { campusData } from "./campusData";

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
    this._studentCampus = campusData.find((record: StudentCampus) => {
      return record.cityId === this._city;
    });

    if (this._studentCampus === undefined) {
      throw new Error("Campus not found");
    }
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  protected abstract getLatestEvents(n: number): Promise<any>;
}

export default Scrapper;
