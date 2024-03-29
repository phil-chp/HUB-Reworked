import IntraAPI from "@shared/services/IntraAPI";
import User from "@shared/types/User";
import HubActivity from "@shared/types/HubActivity";
import RawHubActivity from "@shared/types/RawHubActivity";
import HubActivityGrade from "@shared/types/HubActivityGrade";
import RawHubProject from "@shared/types/RawHubProject";

export default class HubProject extends HubActivity {
  type: "Project" = "Project";

  constructor(data: RawHubActivity, userData: User = null, region: string = null) {
    super(data, userData, region);
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public override async init(): Promise<boolean> {
    if (
      (await this._calcAttendance(this._userData.login, this._userData.year, this._region)) === false ||
      (await this._calcMemberCount(this._userData.login, this._userData.year, this._region)) === false
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

  private async _calcAttendance(login: string, year: string, region: string): Promise<boolean> {
    const url = `module/${year}/B-INN-000/${region}-0-1/${this.codeacti}/note`;
    const grades: HubActivityGrade[] = await this._fetchActivity(url);

    if (!Array.isArray(grades) || grades.length === 0) return false;
    const userGrade = grades.find((grade) => grade.login === login);

    if (userGrade === undefined || userGrade.note === null) return false;
    if (userGrade.status === "present") {
      this.presences = 1;
    } else if (userGrade.status === "absent") {
      this.absences = 1;
    } else {
      return false;
    }

    this.grade = userGrade.note;
    return true;
  }

  private async _calcMemberCount(login: string, year: string, region: string): Promise<boolean> {
    const project: RawHubProject = await IntraAPI.getInstance().fetch(
      `module/${year}/B-INN-000/${region}-0-1/${this.codeacti}/project`
    );
    if (project === undefined || project === null) return false;

    for (const registered of project.registered) {
      const { master, members } = registered;
      const logins = [master, ...members].filter((user) => user?.login !== undefined).map((user) => user.login);
      if (logins.includes(login)) {
        this.members = logins.length;
        break;
      }
    }
  }
}
