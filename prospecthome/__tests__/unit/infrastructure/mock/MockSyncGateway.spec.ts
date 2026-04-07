import { MockSyncGateway } from "../../../../src/infrastructure/mock/MockSyncGateway";
import { Prospecto } from "../../../../src/domain/entities/Prospecto";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";

describe("MockSyncGateway", () => {
  let gateway: MockSyncGateway;

  beforeEach(() => {
    gateway = new MockSyncGateway();
  });

  it("deve simular upload e retornar um remoteId aleatorio", async () => {
    const prospecto = Prospecto.create({
      id: "local-id",
      userId: "user-1",
      photoPath: new PhotoPath("x.jpg"),
      coordinates: new Coordinates(0, 0)
    });

    const remoteId = await gateway.uploadProspecto(prospecto);
    expect(remoteId).toContain("remote-mock-");
  });

  it("deve simular o pull de atualizacoes limitadas", async () => {
    const date = new Date();
    const result = await gateway.pullUpdates("user-1", date);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0); // Para o mock inicial, array vazio ou mockado
  });
});
