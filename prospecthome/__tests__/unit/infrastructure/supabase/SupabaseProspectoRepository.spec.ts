import { SupabaseProspectoRepository } from "../../../../src/infrastructure/database/supabase/SupabaseProspectoRepository";
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

function makeMockSupabase(overrides: { storageFrom?: any; dbFrom?: any; authUser?: any } = {}) {
  const defaultStorageFrom = {
    upload: jest.fn().mockResolvedValue({ data: { path: "uploaded" }, error: null }),
    createSignedUrl: jest.fn().mockResolvedValue({
      data: { signedUrl: "https://supabase.example.com/signed/photo.jpg?token=abc" },
      error: null,
    }),
    remove: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  const defaultDbFrom = {
    upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    delete: jest.fn().mockReturnThis(),
  };

  const storageFrom = overrides.storageFrom ?? defaultStorageFrom;
  const dbFrom = overrides.dbFrom ?? defaultDbFrom;
  const authUser = "authUser" in overrides ? overrides.authUser : { id: "user-uuid" };

  return {
    storage: { from: jest.fn().mockReturnValue(storageFrom) },
    from: jest.fn().mockReturnValue(dbFrom),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: authUser }, error: null }),
    },
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

describe("SupabaseProspectoRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedReadAsStringAsync.mockResolvedValue("ZmFrZS1iYXNlNjQ=");
  });

  describe("findAll", () => {
    it("retorna prospectos do usuário autenticado", async () => {
      const remoteRows = [
        {
          id: "p-1",
          user_id: "user-uuid",
          photo_url: "https://photo.jpg",
          lat: -21.5,
          lng: -45.4,
          notes: null,
          status: "novo",
          address_endereco: null,
          address_bairro: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];
      const dbFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: remoteRows, error: null }),
      };
      const supabase = makeMockSupabase({ dbFrom });
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);

      const result = await repo.findAll();

      expect(supabase.from).toHaveBeenCalledWith("prospectos");
      expect(dbFrom.eq).toHaveBeenCalledWith("user_id", "user-uuid");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("p-1");
    });

    it("retorna array vazio quando nenhum registro encontrado", async () => {
      const supabase = makeMockSupabase();
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);

      const result = await repo.findAll();
      expect(result).toEqual([]);
    });

    it("retorna array vazio se não há usuário autenticado", async () => {
      const supabase = makeMockSupabase({ authUser: null });
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);

      const result = await repo.findAll();
      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("retorna prospecto quando ID existe", async () => {
      const row = {
        id: "p-1",
        user_id: "user-uuid",
        photo_url: "https://photo.jpg",
        lat: -21.5,
        lng: -45.4,
        notes: "teste",
        status: "novo",
        address_endereco: null,
        address_bairro: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };
      const dbFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: row, error: null }),
      };
      const supabase = makeMockSupabase({ dbFrom });
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);

      const result = await repo.findById("p-1");

      expect(dbFrom.eq).toHaveBeenCalledWith("id", "p-1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("p-1");
      expect(result!.notes).toBe("teste");
    });

    it("retorna null quando ID não existe", async () => {
      const supabase = makeMockSupabase();
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);

      const result = await repo.findById("inexistente");
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("faz upload de foto local e upsert no banco", async () => {
      const supabase = makeMockSupabase();
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);
      const prospecto = makeProspecto();

      await repo.save(prospecto);

      expect(supabase._storageFrom.upload).toHaveBeenCalled();
      expect(supabase._dbFrom.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "p-uuid",
          user_id: "user-uuid",
          photo_url: "https://supabase.example.com/signed/photo.jpg?token=abc",
        }),
        { onConflict: "id" }
      );
    });

    it("não faz upload se photoPath já é URL", async () => {
      const supabase = makeMockSupabase();
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);
      const prospecto = Prospecto.create({
        id: "p-uuid",
        userId: "user-uuid",
        photoPath: new PhotoPath("https://existing-url.com/photo.jpg"),
        coordinates: new Coordinates(-21.5, -45.4),
      });

      await repo.save(prospecto);

      expect(supabase._storageFrom.upload).not.toHaveBeenCalled();
      expect(supabase._dbFrom.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          photo_url: "https://existing-url.com/photo.jpg",
        }),
        { onConflict: "id" }
      );
    });
  });

  describe("delete", () => {
    it("remove registro do banco e arquivo do storage", async () => {
      const supabase = makeMockSupabase();
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);

      await repo.delete("p-uuid");

      expect(supabase._dbFrom.delete).toHaveBeenCalled();
      expect(supabase._dbFrom.eq).toHaveBeenCalledWith("id", "p-uuid");
      expect(supabase._storageFrom.remove).toHaveBeenCalledWith(["user-uuid/p-uuid.jpg"]);
    });
  });

  describe("findPending", () => {
    it("lança erro pois conceito é local-only", async () => {
      const supabase = makeMockSupabase();
      const repo = new SupabaseProspectoRepository(supabase as any, makePhotoStorage() as any);

      await expect(repo.findPending()).rejects.toThrow("findPending não aplicável ao repositório remoto");
    });
  });
});
