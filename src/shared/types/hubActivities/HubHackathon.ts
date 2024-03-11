import HubActivity from "@shared/types/HubActivity";
import RawHubActivity from "@shared/types/RawHubActivity";

export default class HubHackathon extends HubActivity {
  type: "Hackathon" = "Hackathon";

  constructor(data: RawHubActivity) {
    super(data);
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public override init(): Promise<boolean> {
    if (this._calculateParticipation(this._events) === false) {
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
    return this.presences * 6 + this.absences * -6;
  }
}
