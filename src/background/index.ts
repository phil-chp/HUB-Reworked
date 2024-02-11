import Epitech from "@background/services/Epitech";
import Server from "@background/services/Server";

const epi = new Epitech();

(async () => {
  await epi.init();
  Server.getInstance(epi);
})();
