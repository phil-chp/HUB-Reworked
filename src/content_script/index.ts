import HubXPReport from "@content_script/components/HubXPReport.vue";
import { mountAfter } from "@content_script/services/utils";

mountAfter(HubXPReport, "#profil .rzone span.note");
