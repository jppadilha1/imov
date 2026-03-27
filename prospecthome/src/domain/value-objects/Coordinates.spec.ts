import { Coordinates } from "./Coordinates";

describe("Coordinates Value Object", () => {
  it("deve criar uma coordenada quando os valores sao validos", () => {
    const coords = new Coordinates(-23.5505, -46.6333); // Sao Paulo
    expect(coords.latitude).toBe(-23.5505);
    expect(coords.longitude).toBe(-46.6333);
  });

  it("deve rejeitar uma latitude maior que 90", () => {
    expect(() => new Coordinates(91, 0)).toThrow("Latitude inválida. Deve estar entre -90 e 90.");
  });

  it("deve rejeitar uma latitude menor que -90", () => {
    expect(() => new Coordinates(-91, 0)).toThrow("Latitude inválida. Deve estar entre -90 e 90.");
  });

  it("deve rejeitar uma longitude maior que 180", () => {
    expect(() => new Coordinates(0, 181)).toThrow("Longitude inválida. Deve estar entre -180 e 180.");
  });

  it("deve rejeitar uma longitude menor que -180", () => {
    expect(() => new Coordinates(0, -181)).toThrow("Longitude inválida. Deve estar entre -180 e 180.");
  });
});
