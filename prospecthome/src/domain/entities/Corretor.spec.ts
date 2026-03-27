import { Corretor } from "./Corretor";

describe("Corretor Entity", () => {
  it("deve criar um corretor com os dados obrigatórios", () => {
    const corretor = Corretor.create({ id: "auth-123", email: "corretor@teste.com" });
    expect(corretor.id).toBe("auth-123");
    expect(corretor.email).toBe("corretor@teste.com");
    expect(corretor.nome).toBeNull();
    expect(corretor.createdAt).toBeInstanceOf(Date);
  });

  it("deve criar um corretor completo (com nome)", () => {
    const corretor = Corretor.create({ id: "auth-123", email: "a@b.com", nome: "Carlos" });
    expect(corretor.nome).toBe("Carlos");
  });

  it("deve reconstruir o objeto a partir do banco de dados fielmente", () => {
    const pastDate = new Date("2025-01-01T10:00:00Z");
    const corretor = new Corretor("auth-999", "b@c.com", "Julia", pastDate);
    expect(corretor.createdAt).toBe(pastDate);
    expect(corretor.id).toBe("auth-999");
  });
});
