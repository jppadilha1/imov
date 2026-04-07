import { NetworkService } from "../../../../src/infrastructure/network/NetworkService";
import * as NetInfo from "@react-native-community/netinfo";

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn()
}));

describe("NetworkService", () => {
  let service: NetworkService;

  beforeEach(() => {
    service = new NetworkService();
    jest.clearAllMocks();
  });

  it("deve retornar true quando isConnected for verdadeiro", async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

    const connected = await service.isConnected();
    expect(connected).toBe(true);
  });

  it("deve retornar false quando isConnected for falso ou null", async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: null });

    const connected = await service.isConnected();
    expect(connected).toBe(false);
  });

  it("deve retornar false se houver falha na checagem", async () => {
    (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

    const connected = await service.isConnected();
    expect(connected).toBe(false);
  });
});
