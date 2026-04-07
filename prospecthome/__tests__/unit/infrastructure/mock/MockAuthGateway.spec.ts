import { MockAuthGateway } from "../../../../src/infrastructure/mock/MockAuthGateway";

describe("MockAuthGateway", () => {
  let gateway: MockAuthGateway;

  beforeEach(() => {
    gateway = new MockAuthGateway();
  });

  describe("login", () => {
    it("deve retornar um corretor se as crendencias forem sucesso@teste.com", async () => {
      const response = await gateway.login("sucesso@teste.com", "123456");
      expect(response.corretor.email).toBe("sucesso@teste.com");
      expect(response.token).toBe("mock-jwt-token");
    });

    it("deve lancar erro (Authentication failed) caso falhe", async () => {
      await expect(gateway.login("erro@teste.com", "senha")).rejects.toThrow("Authentication failed");
    });
  });

  describe("register", () => {
    it("deve registrar o usuario", async () => {
      const response = await gateway.register("novo@teste.com", "senha", "Novo Corretor");
      expect(response.corretor.nome).toBe("Novo Corretor");
      expect(response.token).toBe("mock-jwt-token-new");
    });
  });

  describe("refreshToken", () => {
    it("deve retornar um novo token", async () => {
      const response = await gateway.refreshToken("old-token");
      expect(response.token).toBe("new-mock-jwt-token");
    });
  });
});
