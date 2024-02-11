import User from "@shared/types/User";
import RawHubActivity from "@shared/types/RawHubActivity";

type HubActivityType =
  | "Talk"
  | "Workshop"
  | "Hackathon"
  | "Experience"
  | "Project";

abstract class HubActivity {
  abstract type: HubActivityType;
  title: string;
  presences: number = 0;
  absences: number = 0;
  xp: number = 0;
  to_come: boolean;

  protected _events: any[];
  protected _codeacti: string;
  protected _end: string;
  protected _userData: User;
  protected _region: string;

  constructor(data: RawHubActivity, userData?: User, region?: string) {
    this.title = data.title;
    this._events = data.events;
    this._codeacti = data.codeacti;
    this._end = data.end;
    this._userData = userData;
    this._region = region;
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  /**
   * Initialize the data for the activity
   * @param data Activity data
   * @param userData User data (user for Project/Experience, we require the user login and the year)
   * @param region Region of the user (either the country or the city)
   */
  public abstract init(): Promise<boolean>;

  // *----------------------------------------------------------------------* //
  // *                               Protected                              * //
  // *----------------------------------------------------------------------* //

  /**
   * Calculate the number of presences and absences for an event
   * @param events Array of events present in the activity data
   * @returns False if there are no events, true otherwise
   */
  protected _calculateParticipation(events: any[]): boolean {
    if (events.length == 0) return false;
    events.forEach((event) => {
      if (event.user_status === "present") {
        this.presences++;
      } else if (event.user_status === "absent") {
        this.absences++;
      }
    });
    return true;
  }

  /**
   * Based on the number of presences and absences, calculate the XP
   * The value for each is defined in the intranet.
   * @returns The calculated XP
   */
  protected abstract _calculateXP(): number;

  /**
   * Determine if the event is yet to come
   * @param data Activity data
   * @returns True if the event is yet to come, false otherwise
   */
  protected _determineIfToCome(data: any): boolean {
    return new Date(data.end).getTime() > Date.now();
  }
}

export default HubActivity;
