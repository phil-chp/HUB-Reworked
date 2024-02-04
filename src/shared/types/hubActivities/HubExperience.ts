import HubActivity from "../HubActivity";

export default class HubExperience extends HubActivity {
  type: "Experience" = "Experience";

  constructor(data: any) {
    super(data);
  }

  protected _calculateXP(): number {
    return // Return 0
  }
}
