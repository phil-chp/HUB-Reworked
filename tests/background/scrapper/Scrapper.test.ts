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
    const events = await scrapperMeetup.getLatestEvents(1);

    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);

    const eventsStored = await scrapperMeetup.getLatestEvents(1);
    expect(eventsStored).toBeDefined();
  });

  test("ScrapperMeetup::init wrong campus", async () => {
    const scrapperMeetupWrongCampus = new ScrapperMeetup("XXX", "YY");
    expect(scrapperMeetupWrongCampus.init()).rejects.toThrow(Error);
  });
});
