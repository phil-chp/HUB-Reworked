import HubActivity from "@shared/types/HubActivity";
import RawHubActivity from "@shared/types/RawHubActivity";
import User from "@shared/types/User";

export default class HubTalk extends HubActivity {
  type: "Talk" = "Talk";

  constructor(data: RawHubActivity, userData: User = null) {
    super(data, userData);
  }

  // *----------------------------------------------------------------------* //
  // *                                Public                                * //
  // *----------------------------------------------------------------------* //

  public override init(): Promise<boolean> {
    if (this._calculateParticipation(this._events) === false) {
      return new Promise((resolve) => resolve(false));
    }
    this.xp = this._calculateXP(1, -1, 4, -6);
    this.to_come = this._determineIfToCome(this._end);
    return new Promise((resolve) => resolve(true));
  }
}
