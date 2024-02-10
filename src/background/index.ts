import DataHubActivities from "@shared/types/DataHubActivities";
import Epitech from "./services/Epitech";

const epi = new Epitech();

(async () => {
    await epi.init();

    // TODO: Move
    chrome.runtime.onConnect.addListener((socket: chrome.runtime.Port) => {

        socket.onMessage.addListener(async (data: any) => {

            function sendResponse(payload: any) {
                socket.postMessage({
                    seq: data.seq,
                    d: payload,
                });
            }

            switch (data.op) {
                case "XP":
                    const activities = await epi.fetchHubActivities();
                    const response: DataHubActivities = {
                        d: Date.now(),
                        activities,
                    };

                    return sendResponse(response);
            }
        });
    });
})();
