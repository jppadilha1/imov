import { SyncProspectosUseCase } from "./SyncProspectosUseCase";
import { Prospecto } from "../../domain/entities/Prospecto";
import { PhotoPath } from "../../domain/value-objects/PhotoPath";
import { Coordinates } from "../../domain/value-objects/Coordinates";

describe("SyncProspectosUseCase", () => {
  let useCase: SyncProspectosUseCase;
  let mockSyncGateway: { uploadProspecto: jest.Mock, pullUpdates: jest.Mock };
  let mockProspectoRepo: { findPending: jest.Mock, save: jest.Mock };

  beforeEach(() => {
    mockSyncGateway = {
      uploadProspecto: jest.fn(),
      pullUpdates: jest.fn()
    };
    mockProspectoRepo = {
      findPending: jest.fn(),
      save: jest.fn()
    };

    useCase = new SyncProspectosUseCase(
      mockSyncGateway as any,
      mockProspectoRepo as any
    );
  });

  const createPendingProspecto = (id: string) => {
    return Prospecto.create({
      id,
      userId: "user-1",
      photoPath: new PhotoPath("photo.jpg"),
      coordinates: new Coordinates(0, 0)
    });
  };

  it("deve carregar itens pendentes e fazer upload com sucesso de todos, marcando como sync e salvando", async () => {
    const p1 = createPendingProspecto("local-1");
    const p2 = createPendingProspecto("local-2");

    mockProspectoRepo.findPending.mockResolvedValue([p1, p2]);
    mockSyncGateway.uploadProspecto.mockImplementation(async (p) => `remote-${p.id}`);
    
    await useCase.execute();

    expect(mockProspectoRepo.findPending).toHaveBeenCalled();
    expect(mockSyncGateway.uploadProspecto).toHaveBeenCalledTimes(2);

    expect(p1.isPending()).toBe(false);
    expect(p1.remoteId).toBe("remote-local-1");
    
    expect(mockProspectoRepo.save).toHaveBeenCalledTimes(2);
    expect(mockProspectoRepo.save).toHaveBeenCalledWith(p1);
    expect(mockProspectoRepo.save).toHaveBeenCalledWith(p2);
  });

  it("deve marcar com markSyncError caso o upload de um dos itens falhe, sem jogar erro global", async () => {
    const p1 = createPendingProspecto("local-1");
    const p2 = createPendingProspecto("local-2");

    mockProspectoRepo.findPending.mockResolvedValue([p1, p2]);

    mockSyncGateway.uploadProspecto.mockImplementation(async (p) => {
      if (p.id === "local-1") throw new Error("Network offline");
      return "remote-local-2";
    });

    await useCase.execute();

    // 1 falhou
    expect(p1.syncStatus.isError()).toBe(true);
    expect(p1.isPending()).toBe(false);

    // 2 funcionou
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
});
