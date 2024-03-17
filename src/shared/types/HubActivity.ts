import User from "@shared/types/User";
import RawHubActivity from "@shared/types/RawHubActivity";
import HubActivityGrade from "@shared/types/HubActivityGrade";
import IntraAPI from "@shared/services/IntraAPI";

type HubActivityType = "Talk" | "Workshop" | "Hackathon" | "Experience" | "Project";

abstract class HubActivity {
  abstract type: HubActivityType;
  title: string;
  presences: number = 0;
  absences: number = 0;
  orgPresences: number = 0;
  orgAbsences: number = 0;
  xp: number = 0;
  codeacti: string;
  to_come: boolean;
  grade: number; // Used for Project and Experience
  members: number; // Used for Project

  protected _events: any[];
  protected _end: string; // TODO: Pass to public?
  protected _userData: User;
  protected _region: string;
  protected _ignore: boolean;

  constructor(data: RawHubActivity, userData?: User, region?: string) {
    this.title = data.title;
    this._events = data.events;
    this.codeacti = data.codeacti;
    this._end = data.end;
    this._userData = userData;
    this._region = region;
    this._ignore = false;
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
   * Also takes into account organization presences and absences
   * @param events Array of events present in the activity data
   * @returns False if there are no events, true otherwise
   */
  protected _calculateParticipation(events: any[]): boolean {
    if (events.length === 0) return false;

    for (let i = 0; i < events.length; ++i) {
      if (events[i].user_status === "present") {
        ++this.presences;
      } else if (events[i].user_status === "absent") {
        ++this.absences;
      }

      if (events[i].assistants?.length == 0) continue;
      for (let j = 0; j < events[i].assistants.length; ++j) {
        const assistant = events[i].assistants[j];
        if (assistant.login !== this._userData.login) continue;

        if (assistant.manager_status === "present") {
          ++this.orgPresences;
        } else if (assistant.manager_status === "absent") {
          ++this.orgAbsences;
        }
      }
    }

    return true;
  }

  /**
   * Based on the number of presences and absences,
   * calculate the XP worth of this activity.
   * All default to 0 if not specified.
   * @param bonus XP earned for each presence
   * @param malus XP lost for each absence
   * @param orgBonus XP earned for each organization presence
   * @param orgMalus XP lost for each organization absence
   * @returns The calculated XP
   */
  protected _calculateXP(bonus = 0, malus = 0, orgBonus = 0, orgMalus = 0): number {
    const p  = Number(Boolean(this.presences));
    const a  = Number(Boolean(this.absences));
    const op = Number(Boolean(this.orgPresences));
    const oa = Number(Boolean(this.orgAbsences));

    return p * bonus + a * malus + op * orgBonus + oa * orgMalus;
  }

  /**
   * Determine if the event is yet to come
   * @param data Activity data
   * @returns True if the event is yet to come, false otherwise
   */
  protected _determineIfToCome(data: any): boolean {
    return new Date(data.end).getTime() > Date.now();
  }

  /**
   * For HubProject & HubExperience, fetch the activity data making sure to handle rate limiting
   * (Yes this is a specific function, and shouldn't be live in the abstract class)
   * @param url The URL to call
   * @param attempts Max amount of attempts before giving up
   * @param timeout the timeout to wait before retrying (first attempt will be slowed down to 5s to dissarm Anti-DDoS)
   * @returns
   */
  protected async _fetchActivity(url: string, attempts: number = 5, timeout: number = 2000): Promise<HubActivityGrade[]> {
    let attempt = 1;
    while (attempt <= attempts) {
      try {
        const res: any = await IntraAPI.getInstance().fetchThrow(url);
        if (res && res.status === 429) {
          throw new Error("Rate limited");
        }
        return res as HubActivityGrade[];
      } catch (error) {
        if (attempt > attempts) break;
        const cooldown = (attempt == 1 ? 10000 : timeout * 2 * attempt);
        console.log(`[IntraAPI] Rate limited, retrying in ${cooldown}ms... (${attempt}/${attempts})`)
        await new Promise((resolve) => setTimeout(resolve, cooldown));
        ++attempt;
      }
    }
    console.error(`Failed to fetch activity data after ${attempts} attempts`);
  }
}

export default HubActivity;
