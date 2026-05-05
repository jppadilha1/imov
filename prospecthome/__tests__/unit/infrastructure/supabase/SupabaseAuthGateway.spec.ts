import { SupabaseAuthGateway } from "../../../../src/infrastructure/supabase/SupabaseAuthGateway";
import { Corretor } from "../../../../src/domain/entities/Corretor";

type MockedSupabase = {
  auth: {
    signInWithPassword: jest.Mock;
    signUp: jest.Mock;
    signOut: jest.Mock;
    refreshSession: jest.Mock;
  };
};

function makeMockSupabase(): MockedSupabase {
  return {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    },
  };
}

const fakeUser = (overrides: Partial<any> = {}) => ({
  id: "uuid-123",
  email: "joao@example.com",
  user_metadata: { nome: "João" },
  created_at: "2026-04-01T10:00:00.000Z",
  ...overrides,
});

const fakeSession = (userOverrides: Partial<any> = {}) => ({
  access_token: "jwt-token-abc",
  user: fakeUser(userOverrides),
});

describe("SupabaseAuthGateway", () => {
  let supabase: MockedSupabase;
  let gateway: SupabaseAuthGateway;

  beforeEach(() => {
    supabase = makeMockSupabase();
    gateway = new SupabaseAuthGateway(supabase as any);
  });

  describe("login", () => {
    it("retorna corretor e token quando credenciais são válidas", async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: fakeSession() },
        error: null,
      });

      const result = await gateway.login("joao@example.com", "senha123");

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "joao@example.com",
        password: "senha123",
      });
      expect(result.token).toBe("jwt-token-abc");
      expect(result.corretor).toBeInstanceOf(Corretor);
      expect(result.corretor.id).toBe("uuid-123");
      expect(result.corretor.email).toBe("joao@example.com");
      expect(result.corretor.nome).toBe("João");
    });

    it("lança Error quando o Supabase retorna erro", async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: "Invalid login credentials" },
      });

      await expect(gateway.login("x@y.com", "bad")).rejects.toThrow("Invalid login credentials");
    });

    it("nome do corretor é null quando user_metadata.nome está ausente", async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: fakeSession({ user_metadata: {} }) },
        error: null,
      });

      const result = await gateway.login("a@b.com", "pwd");

      expect(result.corretor.nome).toBeNull();
    });
  });

  describe("register", () => {
    it("cria usuário e retorna corretor com nome do user_metadata", async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { session: fakeSession({ user_metadata: { nome: "Maria" } }) },
        error: null,
      });

      const result = await gateway.register("maria@example.com", "senha456", "Maria");

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "maria@example.com",
        password: "senha456",
        options: { data: { nome: "Maria" } },
      });
      expect(result.corretor.nome).toBe("Maria");
    });

    it("lança Error quando email já existe", async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { session: null },
        error: { message: "User already registered" },
      });

      await expect(gateway.register("dup@x.com", "p", "Foo")).rejects.toThrow("User already registered");
    });
  });

  describe("logout", () => {
    it("invoca supabase.auth.signOut sem erros", async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await expect(gateway.logout()).resolves.toBeUndefined();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("lança Error quando signOut retorna erro", async () => {
      supabase.auth.signOut.mockResolvedValue({ error: { message: "Network error" } });

      await expect(gateway.logout()).rejects.toThrow("Network error");
    });
  });

  describe("refreshToken", () => {
    it("retorna novo corretor e token após refresh", async () => {
      supabase.auth.refreshSession.mockResolvedValue({
        data: { session: { ...fakeSession(), access_token: "new-jwt" } },
        error: null,
      });

      const result = await gateway.refreshToken("old-jwt");

      expect(result.token).toBe("new-jwt");
      expect(result.corretor.id).toBe("uuid-123");
    });

    it("lança Error quando refresh falha", async () => {
      supabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: "Token expired" },
      });

      await expect(gateway.refreshToken("old")).rejects.toThrow("Token expired");
    });
  });
});
