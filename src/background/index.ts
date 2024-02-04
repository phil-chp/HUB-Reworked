// require("services/EpitechAPI.ts");
import Epitech from "./services/Epitech";

const epitech = new Epitech();

(async () => {
    await epitech.init();
    await epitech.fetchHubActivities();
})();
