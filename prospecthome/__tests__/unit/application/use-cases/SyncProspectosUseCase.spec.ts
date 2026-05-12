import { SyncProspectosUseCase } from "../../../../src/application/use-cases/SyncProspectosUseCase";
import { Prospecto } from "../../../../src/domain/entities/Prospecto";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import { Address } from "../../../../src/domain/value-objects/Address";

describe("SyncProspectosUseCase", () => {
  let useCase: SyncProspectosUseCase;
  let mockSyncGateway: { uploadProspecto: jest.Mock; pullUpdates: jest.Mock };
  let mockProspectoRepo: { findPending: jest.Mock; save: jest.Mock };
  let mockGeocodeService: { reverseGeocode: jest.Mock };

  beforeEach(() => {
    mockSyncGateway = {
      uploadProspecto: jest.fn(),
      pullUpdates: jest.fn(),
    };
    mockProspectoRepo = {
      findPending: jest.fn(),
      save: jest.fn(),
    };
    mockGeocodeService = {
      reverseGeocode: jest.fn(),
    };

    useCase = new SyncProspectosUseCase(
      mockSyncGateway as any,
      mockProspectoRepo as any,
      mockGeocodeService as any
    );
  });

  const createPendingProspecto = (id: string) => {
    return Prospecto.create({
      id,
      userId: "user-1",
      photoPath: new PhotoPath("photo.jpg"),
      coordinates: new Coordinates(0, 0),
    });
  };

  it("deve carregar itens pendentes e fazer upload com sucesso de todos, marcando como sync e salvando", async () => {
    const p1 = createPendingProspecto("local-1");
    const p2 = createPendingProspecto("local-2");

    mockProspectoRepo.findPending.mockResolvedValue([p1, p2]);
    mockSyncGateway.uploadProspecto.mockImplementation(async (p: Prospecto) => `remote-${p.id}`);
    mockGeocodeService.reverseGeocode.mockResolvedValue(null);

    await useCase.execute();

    expect(mockProspectoRepo.findPending).toHaveBeenCalled();
    expect(mockSyncGateway.uploadProspecto).toHaveBeenCalledTimes(2);

    expect(p1.isPending()).toBe(false);
    expect(p1.remoteId).toBe("remote-local-1");

    expect(mockProspectoRepo.save).toHaveBeenCalledWith(p1);
    expect(mockProspectoRepo.save).toHaveBeenCalledWith(p2);
  });

  it("deve marcar com markSyncError caso o upload de um dos itens falhe, sem jogar erro global", async () => {
    const p1 = createPendingProspecto("local-1");
    const p2 = createPendingProspecto("local-2");

    mockProspectoRepo.findPending.mockResolvedValue([p1, p2]);
    mockGeocodeService.reverseGeocode.mockResolvedValue(null);

    mockSyncGateway.uploadProspecto.mockImplementation(async (p: Prospecto) => {
      if (p.id === "local-1") throw new Error("Network offline");
      return "remote-local-2";
    });

    await useCase.execute();

    expect(p1.syncStatus.isError()).toBe(true);
    expect(p1.isPending()).toBe(false);

    expect(p2.isPending()).toBe(false);
    expect(p2.syncStatus.isSynced()).toBe(true);

    expect(mockProspectoRepo.save).toHaveBeenCalledTimes(2);
  });

  it("nao deve fazer nada se nao houver pendentes", async () => {
    mockProspectoRepo.findPending.mockResolvedValue([]);

    await useCase.execute();

    expect(mockSyncGateway.uploadProspecto).not.toHaveBeenCalled();
    expect(mockProspectoRepo.save).not.toHaveBeenCalled();
  });

  it("resolve endereço via geocodeService antes do upload quando address é null", async () => {
    const prospecto = createPendingProspecto("local-1");
    const resolvedAddress = new Address("Rua das Flores", "S/N", "Pinheiros", "", "", "00000000");

    mockProspectoRepo.findPending.mockResolvedValue([prospecto]);
    mockGeocodeService.reverseGeocode.mockResolvedValue(resolvedAddress);
    mockSyncGateway.uploadProspecto.mockResolvedValue("remote-local-1");

    await useCase.execute();

    expect(mockGeocodeService.reverseGeocode).toHaveBeenCalledWith(prospecto.coordinates);
    expect(prospecto.address).toBe(resolvedAddress);
    // save called once for address persist + once for markSynced
    expect(mockProspectoRepo.save).toHaveBeenCalledTimes(2);
  });

  it("não chama geocodeService quando prospecto já tem endereço", async () => {
    const prospecto = createPendingProspecto("local-1");
    prospecto.resolveAddress(new Address("Rua X", "S/N", "Bairro Y", "", "", "00000000"));

    mockProspectoRepo.findPending.mockResolvedValue([prospecto]);
    mockSyncGateway.uploadProspecto.mockResolvedValue("remote-local-1");

    await useCase.execute();

    expect(mockGeocodeService.reverseGeocode).not.toHaveBeenCalled();
  });

  it("prossegue com upload quando geocodeService retorna null", async () => {
    const prospecto = createPendingProspecto("local-1");

    mockProspectoRepo.findPending.mockResolvedValue([prospecto]);
    mockGeocodeService.reverseGeocode.mockResolvedValue(null);
    mockSyncGateway.uploadProspecto.mockResolvedValue("remote-local-1");

    await useCase.execute();

    expect(mockSyncGateway.uploadProspecto).toHaveBeenCalledWith(prospecto);
    expect(prospecto.address).toBeNull();
    expect(prospecto.syncStatus.isSynced()).toBe(true);
  });

  it("prossegue com upload quando geocodeService lança exceção", async () => {
    const prospecto = createPendingProspecto("local-1");

    mockProspectoRepo.findPending.mockResolvedValue([prospecto]);
    mockGeocodeService.reverseGeocode.mockRejectedValue(new Error("geocode failed"));
    mockSyncGateway.uploadProspecto.mockResolvedValue("remote-local-1");

    await useCase.execute();

    expect(mockSyncGateway.uploadProspecto).toHaveBeenCalledWith(prospecto);
    expect(prospecto.syncStatus.isSynced()).toBe(true);
  });

  it("chama pullUpdates após upload bem-sucedido para sincronizar com Supabase", async () => {
    const p1 = createPendingProspecto("local-1");
    const remoteProspecto = Prospecto.reconstruct({
      id: "remote-1",
      userId: "user-1",
      photoPath: new PhotoPath("https://supabase.url/photo.jpg"),
      coordinates: new Coordinates(0, 0),
      address: null,
      notes: "atualizado no Supabase",
      status: p1.status,
      syncStatus: p1.syncStatus,
      remoteId: "remote-1",
      createdAt: p1.createdAt,
    });

    mockProspectoRepo.findPending.mockResolvedValue([p1]);
    mockGeocodeService.reverseGeocode.mockResolvedValue(null);
    mockSyncGateway.uploadProspecto.mockResolvedValue("remote-local-1");
    mockSyncGateway.pullUpdates.mockResolvedValue([remoteProspecto]);

    await useCase.execute();

    expect(mockSyncGateway.pullUpdates).toHaveBeenCalledWith("user-1", new Date(0));
    expect(mockProspectoRepo.save).toHaveBeenCalledWith(remoteProspecto);
  });

  it("falha silenciosamente no pull se pullUpdates lança exceção", async () => {
    const p1 = createPendingProspecto("local-1");

    mockProspectoRepo.findPending.mockResolvedValue([p1]);
    mockGeocodeService.reverseGeocode.mockResolvedValue(null);
    mockSyncGateway.uploadProspecto.mockResolvedValue("remote-local-1");
    mockSyncGateway.pullUpdates.mockRejectedValue(new Error("Network error"));

    await expect(useCase.execute()).resolves.not.toThrow();
    expect(mockSyncGateway.pullUpdates).toHaveBeenCalled();
  });
});
