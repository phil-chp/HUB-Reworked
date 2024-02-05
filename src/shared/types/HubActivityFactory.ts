import User from "./User";
import HubActivity from "./HubActivity";
import RawHubActivity from "./RawHubActivity";
import {
  HubTalk,
  HubWorkshop,
  HubHackathon,
  HubExperience,
  HubProject,
} from "./hubActivities";

export default class HubActivityFactory {
  static createActivity(type: string, data: RawHubActivity, userData: User = null, region: string = null): HubActivity | null {
    switch (type) {
      case "Talk":
        return new HubTalk(data);
      case "Workshop":
        return new HubWorkshop(data);
      case "Hackathon":
        return new HubHackathon(data);
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
