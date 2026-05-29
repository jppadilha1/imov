import { ExpoGeocodeService } from "../../../../src/infra/services/ExpoGeocodeService";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import * as Location from "expo-location";

jest.mock("expo-location");
const mockReverseGeocodeAsync = Location.reverseGeocodeAsync as jest.Mock;

describe("ExpoGeocodeService", () => {
  let service: ExpoGeocodeService;
  const coords = new Coordinates(-23.5505, -46.6333);

  beforeEach(() => {
    service = new ExpoGeocodeService();
    jest.clearAllMocks();
  });

  it("retorna Address com street e district quando ambos estão presentes", async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { street: "Rua das Flores", district: "Pinheiros", name: null, subregion: null },
    ]);

    const address = await service.reverseGeocode(coords);

    expect(address).not.toBeNull();
    expect(address!.street).toBe("Rua das Flores");
    expect(address!.neighborhood).toBe("Pinheiros");
  });

  it("usa name como fallback quando street é null", async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { street: null, name: "Praça da Sé", district: "Sé", subregion: null },
    ]);

    const address = await service.reverseGeocode(coords);

    expect(address).not.toBeNull();
    expect(address!.street).toBe("Praça da Sé");
    expect(address!.neighborhood).toBe("Sé");
  });

  it("usa subregion como fallback quando district é null", async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { street: "Av. Paulista", name: null, district: null, subregion: "Bela Vista" },
    ]);

    const address = await service.reverseGeocode(coords);

    expect(address).not.toBeNull();
    expect(address!.neighborhood).toBe("Bela Vista");
  });

  it("retorna null quando array de resultados está vazio", async () => {
    mockReverseGeocodeAsync.mockResolvedValue([]);

    const address = await service.reverseGeocode(coords);

    expect(address).toBeNull();
  });

  it("retorna null quando street e name são null", async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { street: null, name: null, district: "Pinheiros", subregion: null },
    ]);

    const address = await service.reverseGeocode(coords);

    expect(address).toBeNull();
  });

  it("retorna null quando district e subregion são null", async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { street: "Rua das Flores", name: null, district: null, subregion: null },
    ]);

    const address = await service.reverseGeocode(coords);

    expect(address).toBeNull();
  });

  it("retorna null e não propaga quando reverseGeocodeAsync lança exceção", async () => {
    mockReverseGeocodeAsync.mockRejectedValue(new Error("Location permission denied"));

    await expect(service.reverseGeocode(coords)).resolves.toBeNull();
  });

  it("passa latitude e longitude corretos para reverseGeocodeAsync", async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { street: "Av. Paulista", district: "Bela Vista", name: null, subregion: null },
    ]);

    await service.reverseGeocode(coords);

    expect(mockReverseGeocodeAsync).toHaveBeenCalledWith({
      latitude: -23.5505,
      longitude: -46.6333,
    });
  });
});
