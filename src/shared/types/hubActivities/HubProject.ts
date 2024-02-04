import HubActivity from "../HubActivity";

export default class HubHackathon extends HubActivity {
  type: "Hackathon" = "Hackathon";

  constructor(data: any) {
    super(data);
  }

  protected _calculateXP(): number {
    return 0; // Handled separately
  }
}
