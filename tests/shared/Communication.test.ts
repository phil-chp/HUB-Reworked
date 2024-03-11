import Server from "@background/services/Server";
import Client from "@content_script/services/Client";
import Epitech from "@background/services/Epitech";

describe("Communication", () => {
  let server: Server;
  let client: Client;

  beforeAll(async () => {
    server = Server.getInstance();
    client = new Client();
  });

  test("is Client defined", async () => {
    expect(client).toBeDefined();
  });

  test("is Server defined", async () => {
    expect(server).toBeDefined();
  });

  test("Client & Server: TEST event two-way handling", async () => {
    const data = await client.send("TEST");
    expect(data).toEqual(null); // TODO: Hack
  });

  test("Server: undefined Epitech", async () => {
    const epi = new Epitech();
    const serverNoEpi = Server.getInstance(epi);
    expect(serverNoEpi).toBeDefined();
  });
});
