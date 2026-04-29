import { NetworkService } from "../../../../src/infrastructure/network/NetworkService";
import * as NetInfo from "@react-native-community/netinfo";

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => jest.fn()),
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

  it("addListener registra callback via NetInfo.addEventListener", () => {
    const callback = jest.fn();
    const mockUnsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);

    const unsubscribe = service.addListener(callback);

    expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toBe(mockUnsubscribe);
  });

  it("addListener invoca o callback com o valor correto de isConnected", () => {
    const callback = jest.fn();
    let capturedHandler: (state: any) => void = () => {};
    (NetInfo.addEventListener as jest.Mock).mockImplementation((handler) => {
      capturedHandler = handler;
      return jest.fn();
    });

    service.addListener(callback);
    capturedHandler({ isConnected: true });
    expect(callback).toHaveBeenCalledWith(true);

    capturedHandler({ isConnected: null });
    expect(callback).toHaveBeenCalledWith(false);
  });
});
