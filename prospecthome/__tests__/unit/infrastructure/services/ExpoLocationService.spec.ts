import { ExpoLocationService } from "../../../../src/infrastructure/services/ExpoLocationService";
import * as Location from "expo-location";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn()
}));

describe("ExpoLocationService", () => {
  let service: ExpoLocationService;

  beforeEach(() => {
    service = new ExpoLocationService();
    jest.clearAllMocks();
  });

  it("deve retornar Coordinates se as missoes forem concedidas e a loc for coletada", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: -23.55, longitude: -46.63 }
    });

    const coords = await service.getCurrentPosition();
    expect(coords.latitude === -23.55 && coords.longitude === -46.63).toBeTruthy();
  });

  it("deve lancar erro (Permission to access location was denied) se rejeitado", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied" });

    await expect(service.getCurrentPosition()).rejects.toThrow("Permissão de localização negada.");
  });
});
