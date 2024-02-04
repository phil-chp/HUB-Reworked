import HubActivity from "../HubActivity";

export default class HubTalk extends HubActivity {
  type: "Talk" = "Talk";

  constructor(data: any) {
    super(data);
  }

  protected _calculateXP(): number {
    return this.presences * 1 + this.absences * -1;
  }
}
