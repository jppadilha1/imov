import { HybridProspectoRepository } from "../../../../src/infrastructure/database/HybridProspectoRepository";
import { Prospecto } from "../../../../src/domain/entities/Prospecto";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";

function makeProspecto(id: string = "p-1"): Prospecto {
  return Prospecto.create({
    id,
    userId: "user-uuid",
    photoPath: new PhotoPath("photo.jpg"),
    coordinates: new Coordinates(-21.5, -45.4),
  });
}

describe("HybridProspectoRepository", () => {
  let local: any;
  let remote: any;
  let network: any;
  let repo: HybridProspectoRepository;

  beforeEach(() => {
    local = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findPending: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    remote = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      findPending: jest.fn().mockRejectedValue(new Error("not applicable")),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    network = {
      isConnected: jest.fn().mockResolvedValue(true),
      addListener: jest.fn(),
    };
    repo = new HybridProspectoRepository(local, remote, network);
  });

  describe("findAll", () => {
    it("online: busca remoto e atualiza cache local", async () => {
      const p1 = makeProspecto("p-1");
      const p2 = makeProspecto("p-2");
      remote.findAll.mockResolvedValue([p1, p2]);

      const result = await repo.findAll();

      expect(remote.findAll).toHaveBeenCalled();
      expect(local.save).toHaveBeenCalledTimes(2);
      expect(local.save).toHaveBeenCalledWith(p1);
      expect(local.save).toHaveBeenCalledWith(p2);
      expect(result).toEqual([p1, p2]);
    });

    it("offline: lê apenas do cache local", async () => {
      network.isConnected.mockResolvedValue(false);
      const localList = [makeProspecto("p-1")];
      local.findAll.mockResolvedValue(localList);

      const result = await repo.findAll();

      expect(remote.findAll).not.toHaveBeenCalled();
      expect(local.findAll).toHaveBeenCalled();
      expect(result).toEqual(localList);
    });

    it("online com falha remoto: fallback para local", async () => {
      remote.findAll.mockRejectedValue(new Error("Network error"));
      const localList = [makeProspecto("p-1")];
      local.findAll.mockResolvedValue(localList);

      const result = await repo.findAll();

      expect(result).toEqual(localList);
    });
  });

  describe("findById", () => {
    it("online: busca remoto e cacheia", async () => {
      const p = makeProspecto("p-1");
      remote.findById.mockResolvedValue(p);

      const result = await repo.findById("p-1");

      expect(remote.findById).toHaveBeenCalledWith("p-1");
      expect(local.save).toHaveBeenCalledWith(p);
      expect(result).toBe(p);
    });

    it("offline: lê apenas local", async () => {
      network.isConnected.mockResolvedValue(false);
      const p = makeProspecto("p-1");
      local.findById.mockResolvedValue(p);

      const result = await repo.findById("p-1");

      expect(remote.findById).not.toHaveBeenCalled();
      expect(result).toBe(p);
    });

    it("online retorna null: não cacheia", async () => {
      remote.findById.mockResolvedValue(null);

      const result = await repo.findById("missing");

      expect(local.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("online com falha: fallback para local", async () => {
      remote.findById.mockRejectedValue(new Error("Network error"));
      const p = makeProspecto("p-1");
      local.findById.mockResolvedValue(p);

      const result = await repo.findById("p-1");
      expect(result).toBe(p);
    });
  });

  describe("save", () => {
    it("online: salva remoto e local com status synced", async () => {
      const p = makeProspecto("p-1");

      await repo.save(p);

      expect(remote.save).toHaveBeenCalledWith(p);
      expect(local.save).toHaveBeenCalled();
      const localSavedProspecto = local.save.mock.calls[0][0];
      expect(localSavedProspecto.syncStatus.isSynced()).toBe(true);
    });

    it("offline: salva apenas local com status pending", async () => {
      network.isConnected.mockResolvedValue(false);
      const p = makeProspecto("p-1");

      await repo.save(p);

      expect(remote.save).not.toHaveBeenCalled();
      expect(local.save).toHaveBeenCalled();
      const localSavedProspecto = local.save.mock.calls[0][0];
      expect(localSavedProspecto.syncStatus.isPending()).toBe(true);
    });

    it("online com falha remoto: marca pending no local e propaga erro", async () => {
      const p = makeProspecto("p-1");
      remote.save.mockRejectedValue(new Error("Supabase down"));

      await expect(repo.save(p)).rejects.toThrow("Supabase down");
      expect(local.save).toHaveBeenCalled();
      const localSavedProspecto = local.save.mock.calls[0][0];
      expect(localSavedProspecto.syncStatus.isPending()).toBe(true);
    });
  });

  describe("findPending", () => {
    it("sempre delega para local", async () => {
      const pending = [makeProspecto("p-1")];
      local.findPending.mockResolvedValue(pending);

      const result = await repo.findPending();

      expect(local.findPending).toHaveBeenCalled();
      expect(remote.findPending).not.toHaveBeenCalled();
      expect(result).toEqual(pending);
    });

    it("delega para local mesmo offline", async () => {
      network.isConnected.mockResolvedValue(false);
      const pending = [makeProspecto("p-1")];
      local.findPending.mockResolvedValue(pending);

      const result = await repo.findPending();
      expect(result).toEqual(pending);
    });
  });

  describe("delete", () => {
    it("online: remove remoto e local", async () => {
      await repo.delete("p-1");

      expect(remote.delete).toHaveBeenCalledWith("p-1");
      expect(local.delete).toHaveBeenCalledWith("p-1");
    });

    it("offline: remove apenas local", async () => {
      network.isConnected.mockResolvedValue(false);

      await repo.delete("p-1");

      expect(remote.delete).not.toHaveBeenCalled();
      expect(local.delete).toHaveBeenCalledWith("p-1");
    });

    it("online com falha remoto: ainda remove local", async () => {
      remote.delete.mockRejectedValue(new Error("Remote delete failed"));

      await repo.delete("p-1");

      expect(local.delete).toHaveBeenCalledWith("p-1");
    });
  });
});
