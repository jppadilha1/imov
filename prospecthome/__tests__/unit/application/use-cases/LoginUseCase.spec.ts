import { LoginUseCase } from "../../../../src/application/use-cases/LoginUseCase";
import { MockAuthGateway } from "../../../../src/infrastructure/mock/MockAuthGateway";
import { SQLiteSessionRepository } from "../../../../src/infrastructure/database/SQLiteSessionRepository";
import { SQLiteClient } from "../../../../src/infrastructure/database/SQLiteClient";

jest.mock("../../../../src/infrastructure/database/SQLiteClient");

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let authGateway: MockAuthGateway;
  let sessionRepo: SQLiteSessionRepository;

  beforeEach(() => {
    authGateway = new MockAuthGateway();
    sessionRepo = new SQLiteSessionRepository();
    
    // Spies
    jest.spyOn(authGateway, "login");
    // Mock the session repo to not actually hit the DB
    jest.spyOn(sessionRepo, "saveSession").mockResolvedValue(undefined);

    useCase = new LoginUseCase(authGateway, sessionRepo);
  });

  it("deve fazer login e salvar a sessao no repositorio", async () => {
    const result = await useCase.execute("teste@teste.com", "senha123");
    
    expect(authGateway.login).toHaveBeenCalledWith("teste@teste.com", "senha123");
    expect(sessionRepo.saveSession).toHaveBeenCalledWith(result.corretor, result.token);
    expect(result.corretor.email).toBe("teste@teste.com");
  });

  it("deve propagar o erro caso as credenciais sejam invalidas", async () => {
    await expect(useCase.execute("erro@teste.com", "x")).rejects.toThrow("Authentication failed");
  });
});
