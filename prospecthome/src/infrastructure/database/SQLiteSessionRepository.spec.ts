import { SQLiteSessionRepository } from "./SQLiteSessionRepository";
import { Corretor } from "../../domain/entities/Corretor";
import { SQLiteClient } from "./SQLiteClient";

// Criação do mock inline do SQLite Async Methods
const mockDb = {
  getFirstAsync: jest.fn(),
  runAsync: jest.fn(),
};

describe("SQLiteSessionRepository", () => {
  let repository: SQLiteSessionRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    SQLiteClient.setMockDb(mockDb);
    repository = new SQLiteSessionRepository();
  });

  it("deve carregar a sessao limpa (null) se o BD estiver vazio", async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);

    const session = await repository.getSession();
    expect(session).toBeNull();
  });

  it("deve mapear a sessao se encontrar os dados (CorretorEntity mapping)", async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: "u123", email: "jao@b.com", nome: "Jao", 
      created_at: "2024-01-01T00:00:00.000Z", token: "tok123"
    });

    const session = await repository.getSession();
    
    expect(session).toBeDefined();
    expect(session!.corretor).toBeInstanceOf(Corretor);
    expect(session!.corretor.email).toBe("jao@b.com");
    expect(session!.token).toBe("tok123");
  });

  it("deve inserir registro novo limpando anterior (UPSERT logic ou delete/insert)", async () => {
    const corretor = Corretor.create({ id: "987", email: "p@p.com" });
    await repository.saveSession(corretor, "superToken");

    expect(mockDb.runAsync).toHaveBeenCalledWith("DELETE FROM session");
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO session"), 
      expect.arrayContaining(["987", "p@p.com", "superToken"])
    );
  });

  it("deve limpar a sessao corretamente em clear()", async () => {
    await repository.clearSession();
    expect(mockDb.runAsync).toHaveBeenCalledWith("DELETE FROM session");
  });
});
