import { SQLiteProspectoRepository } from "../../../../src/infrastructure/database/SQLiteProspectoRepository";
import { Prospecto } from "../../../../src/domain/entities/Prospecto";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";
import { SQLiteClient } from "../../../../src/infrastructure/database/SQLiteClient";

const mockDb = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn()
};

describe("SQLiteProspectoRepository", () => {
  let repository: SQLiteProspectoRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    SQLiteClient.setMockDb(mockDb);
    repository = new SQLiteProspectoRepository();
  });

  const createFakeProspecto = () => {
    return Prospecto.create({
      id: "uuid-123",
      userId: "corretor-1",
      photoPath: new PhotoPath("mock.jpg"),
      coordinates: new Coordinates(-23.5, -46.6),
      notes: "test notes"
    });
  };

  it("deve salvar(upsert) prospecto corretamente", async () => {
    const prospecto = createFakeProspecto();
    await repository.save(prospecto);

    expect(mockDb.runAsync).toHaveBeenCalled();
    const callArgs = mockDb.runAsync.mock.calls[0][1];
    expect(callArgs).toContain("uuid-123");
    expect(callArgs).toContain("mock.jpg");
    expect(callArgs).toContain(-23.5);
  });

  it("deve carregar a model se achar na base (findById)", async () => {
    const fakeRow = {
      id: "uuid-456",
      user_id: "corretor-test",
      photo_path: "path.jpg",
      lat: 10,
      lng: 20,
      notes: null,
      status: "novo",
      sync_status: "pending",
      remote_id: null,
      address_endereco: null,
      address_bairro: null,
      created_at: new Date().toISOString()
    };
    mockDb.getFirstAsync.mockResolvedValue(fakeRow);

    const prospecto = await repository.findById("uuid-456");

    expect(prospecto).toBeDefined();
    expect(prospecto!.id).toBe("uuid-456");
    expect(prospecto!.coordinates.latitude).toBe(10);
  });

  it("deve retornar null do findById se nao encontrado", async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    expect(await repository.findById("123")).toBeNull();
  });

  it("deve carregar array em findAll", async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: "1", user_id: "u", photo_path: "p.jpg", lat: 0, lng: 0, status: "novo", sync_status: "pending", created_at: new Date().toISOString() }
    ]);
    const list = await repository.findAll();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("1");
  });

  it("deve consultar filtrando por pending no findPending", async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    await repository.findPending();
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("sync_status ="),
      ["pending"]
    );
  });

  it("deve excluir o prospecto", async () => {
    await repository.delete("123");
    expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM prospectos"), ["123"]);
  });
});
