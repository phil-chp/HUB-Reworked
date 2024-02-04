import HubActivity from "../HubActivity";

export default class HubWorkshop extends HubActivity {
  type: "Workshop" = "Workshop";

  constructor(data: any) {
    super(data);
  }

  protected _calculateXP(): number {
    return this.presences * 2 + this.absences * -2;
  }
}
