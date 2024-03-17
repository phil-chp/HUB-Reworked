import User from "@shared/types/User";
import HubActivity from "@shared/types/HubActivity";
import RawHubActivity from "@shared/types/RawHubActivity";
import { HubTalk, HubWorkshop, HubHackathon, HubExperience, HubProject } from "@shared/types/hubActivities";

export default class HubActivityFactory {
  static createActivity(
    type: string,
    data: RawHubActivity,
    userData: User = null,
    region: string = null
  ): HubActivity | null {
    switch (type) {
      case "Talk":
        return new HubTalk(data, userData);
      case "Workshop":
        return new HubWorkshop(data, userData);
      case "Hackathon":
        return new HubHackathon(data, userData);
      case "Experience":
        return new HubExperience(data, userData, region);
      case "Project":
        return new HubProject(data, userData, region);
      default:
        console.warn(`Unknown activity type: "${type}" - ${data.title} (${data.codeacti})`);
        return null;
    }
  }
}
