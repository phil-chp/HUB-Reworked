import EpitechAPI from "@shared/services/EpitechAPI";
import User from "@shared/types/User";
import HubActivity from "@shared/types/HubActivity";
import RawHubActivity from "@shared/types/RawHubActivity";
import HubActivityGrade from "@shared/types/HubActivityGrade";

export default class HubExperience extends HubActivity {
  type: "Experience" = "Experience";
  grade: number;

  constructor(data: RawHubActivity, userData: User = null, region: string = null) {
    super(data, userData, region);
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public override async init(): Promise<boolean> {
    if (
      (await this._verifyPresence(this._codeacti, this._userData.login, this._userData.year, this._region)) === false
    ) {
      return new Promise((resolve) => resolve(false));
    }
    this.xp = this._calculateXP();
    this.to_come = this._determineIfToCome(this._end);
    return new Promise((resolve) => resolve(true));
  }

  // *----------------------------------------------------------------------* //
  // *                                Private                               * //
  // *----------------------------------------------------------------------* //

  protected override _calculateXP(): number {
    return this.presences * 3;
  }

  private async _verifyPresence(codeacti: string, login: string, year: string, region: string): Promise<boolean> {
    const grades: HubActivityGrade[] = await EpitechAPI.getInstance().fetchData(
      `module/${year}/B-INN-000/${region}-0-1/${codeacti}/note`
    );
    if (!Array.isArray(grades) || grades.length === 0) return false;
    const userGrade = grades.find((grade) => grade.login === login);

    if (userGrade === undefined || userGrade.note === null) return false;

    if (userGrade.status === "present") {
      this.presences = 1;
    } else if (userGrade.status === "absent") {
      this.absences = 1; //  NOTE: Not used for Experiences
    } else {
      return false;
    }

    this.grade = userGrade.note;
    return true;
  }
}
