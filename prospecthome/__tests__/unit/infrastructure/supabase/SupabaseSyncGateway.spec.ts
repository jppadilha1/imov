import { SupabaseSyncGateway } from "../../../../src/infrastructure/supabase/SupabaseSyncGateway";
import { Prospecto } from "../../../../src/domain/entities/Prospecto";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";

jest.mock("expo-file-system/legacy", () => ({
  EncodingType: { Base64: "base64" },
  readAsStringAsync: jest.fn(),
}));

import * as FileSystem from "expo-file-system/legacy";

const mockedReadAsStringAsync = FileSystem.readAsStringAsync as jest.Mock;

beforeAll(() => {
  if (typeof globalThis.atob === "undefined") {
    (globalThis as any).atob = (str: string) => Buffer.from(str, "base64").toString("binary");
  }
});

function makeMockSupabase(overrides: { storageFrom?: any; dbFrom?: any } = {}) {
  const defaultStorageFrom = {
    upload: jest.fn().mockResolvedValue({ data: { path: "uploaded" }, error: null }),
    createSignedUrl: jest.fn().mockResolvedValue({
      data: { signedUrl: "https://supabase.example.com/signed/photo.jpg?token=abc" },
      error: null,
    }),
  };
  const defaultDbFrom = {
    upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockResolvedValue({ data: [], error: null }),
  };

  const storageFrom = overrides.storageFrom ?? defaultStorageFrom;
  const dbFrom = overrides.dbFrom ?? defaultDbFrom;

  return {
    storage: { from: jest.fn().mockReturnValue(storageFrom) },
    from: jest.fn().mockReturnValue(dbFrom),
    _storageFrom: storageFrom,
    _dbFrom: dbFrom,
  };
}

function makePhotoStorage(getPhotoUri: jest.Mock = jest.fn().mockResolvedValue("file:///local/photo.jpg")) {
  return {
    savePhoto: jest.fn(),
    deletePhoto: jest.fn(),
    getPhotoUri,
  };
}

function makeProspecto(): Prospecto {
  return Prospecto.create({
    id: "p-uuid",
    userId: "user-uuid",
    photoPath: new PhotoPath("123456-abc.jpg"),
    coordinates: new Coordinates(-21.5, -45.4),
  });
}

describe("SupabaseSyncGateway", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedReadAsStringAsync.mockResolvedValue("ZmFrZS1iYXNlNjQ=");
  });

  describe("uploadProspecto", () => {
    it("envia foto para storage e insere registro no banco, retornando o id", async () => {
      const supabase = makeMockSupabase();
      const photoStorage = makePhotoStorage();
      const gateway = new SupabaseSyncGateway(supabase as any, photoStorage as any);

      const prospecto = makeProspecto();
      const result = await gateway.uploadProspecto(prospecto);

      expect(supabase.storage.from).toHaveBeenCalledWith("prospecto-photos");
      expect(supabase._storageFrom.upload).toHaveBeenCalledWith(
        "user-uuid/p-uuid.jpg",
        expect.any(ArrayBuffer),
        expect.objectContaining({ contentType: "image/jpeg", upsert: true })
      );
      expect(supabase.from).toHaveBeenCalledWith("prospectos");
      expect(supabase._dbFrom.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "p-uuid",
          user_id: "user-uuid",
          photo_url: "https://supabase.example.com/signed/photo.jpg?token=abc",
          lat: -21.5,
          lng: -45.4,
          status: "novo",
        }),
        { onConflict: "id" }
      );
      expect(result).toBe("p-uuid");
    });

    it("lança Error quando upload de foto falha e não insere no banco", async () => {
      const storageFrom = {
        upload: jest.fn().mockResolvedValue({ data: null, error: { message: "Storage 403" } }),
        createSignedUrl: jest.fn(),
      };
      const supabase = makeMockSupabase({ storageFrom });
      const photoStorage = makePhotoStorage();
      const gateway = new SupabaseSyncGateway(supabase as any, photoStorage as any);

      await expect(gateway.uploadProspecto(makeProspecto())).rejects.toThrow(/Storage 403/);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("lança Error quando insert no banco falha após upload da foto", async () => {
      const dbFrom = {
        upsert: jest.fn().mockResolvedValue({ data: null, error: { message: "DB 500" } }),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn(),
      };
      const supabase = makeMockSupabase({ dbFrom });
      const photoStorage = makePhotoStorage();
      const gateway = new SupabaseSyncGateway(supabase as any, photoStorage as any);

      await expect(gateway.uploadProspecto(makeProspecto())).rejects.toThrow(/DB 500/);
    });

    it("lança Error quando foto local não é encontrada", async () => {
      const supabase = makeMockSupabase();
      const photoStorage = makePhotoStorage(jest.fn().mockResolvedValue(null));
      const gateway = new SupabaseSyncGateway(supabase as any, photoStorage as any);

      await expect(gateway.uploadProspecto(makeProspecto())).rejects.toThrow(/Foto local não encontrada/);
    });
  });

  describe("pullUpdates", () => {
    it("retorna array vazio quando nenhum registro encontrado", async () => {
      const supabase = makeMockSupabase();
      const photoStorage = makePhotoStorage();
      const gateway = new SupabaseSyncGateway(supabase as any, photoStorage as any);

      const result = await gateway.pullUpdates("user-uuid", new Date(0));
      expect(result).toEqual([]);
    });

    it("mapeia rows remotos para entidades Prospecto com syncStatus='synced'", async () => {
      const remoteRow = {
        id: "remote-uuid",
        user_id: "user-uuid",
        photo_url: "https://supabase.example.com/photo.jpg?token=xxx",
        lat: -22.0,
        lng: -47.0,
        notes: "Imóvel interessante",
        status: "contatado",
        address_endereco: "Rua A",
        address_bairro: "Centro",
        created_at: "2026-04-01T10:00:00.000Z",
        updated_at: "2026-04-02T11:00:00.000Z",
      };
      const dbFrom = {
        upsert: jest.fn(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockResolvedValue({ data: [remoteRow], error: null }),
      };
      const supabase = makeMockSupabase({ dbFrom });
      const photoStorage = makePhotoStorage();
      const gateway = new SupabaseSyncGateway(supabase as any, photoStorage as any);

      const result = await gateway.pullUpdates("user-uuid", new Date("2026-04-01T00:00:00Z"));

      expect(dbFrom.eq).toHaveBeenCalledWith("user_id", "user-uuid");
      expect(dbFrom.gt).toHaveBeenCalledWith("updated_at", "2026-04-01T00:00:00.000Z");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("remote-uuid");
      expect(result[0].status.value).toBe("contatado");
      expect(result[0].syncStatus.isSynced()).toBe(true);
      expect(result[0].remoteId).toBe("remote-uuid");
    });

    it("lança Error quando query do banco falha", async () => {
      const dbFrom = {
        upsert: jest.fn(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockResolvedValue({ data: null, error: { message: "RLS denied" } }),
      };
      const supabase = makeMockSupabase({ dbFrom });
      const photoStorage = makePhotoStorage();
      const gateway = new SupabaseSyncGateway(supabase as any, photoStorage as any);

      await expect(gateway.pullUpdates("u", new Date(0))).rejects.toThrow(/RLS denied/);
    });
  });
});
