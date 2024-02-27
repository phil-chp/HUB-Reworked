import ScrapperMeetup from "@background/scrapper/ScrapperMeetup";
import { StudentCampus } from "@background/scrapper/Scrapper";

describe("Scrapper", () => {
  let scrapperMeetup: ScrapperMeetup;

  beforeAll(async () => {
    scrapperMeetup = new ScrapperMeetup("PAR", "FR");
    scrapperMeetup.init();
  });

  test("is scrapperMeetup defined", async () => {
    const studentCampus: StudentCampus = scrapperMeetup.getStudentCampus();

    expect(studentCampus).toBeDefined();
    expect(studentCampus.cityName).toBe("Paris");
    expect(studentCampus.countryName).toBe("France");
  });

  test("ScrapperMeetup::getLatestEvents", async () => {
    const events = await scrapperMeetup.getLatestEvents(10);

    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });
});
