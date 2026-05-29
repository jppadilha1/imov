import { LoginUseCase } from "../../../../src/domain/use-cases/LoginUseCase";
import { MockAuthGateway } from "../../../../src/infra/mock/MockAuthGateway";

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let authGateway: MockAuthGateway;

  beforeEach(() => {
    authGateway = new MockAuthGateway();
    jest.spyOn(authGateway, "login");

    useCase = new LoginUseCase(authGateway);
  });

  it("deve fazer login via authGateway e retornar corretor+token", async () => {
    const result = await useCase.execute("teste@teste.com", "senha123");

    expect(authGateway.login).toHaveBeenCalledWith("teste@teste.com", "senha123");
    expect(result.corretor.email).toBe("teste@teste.com");
    expect(result.token).toBeTruthy();
  });

  it("deve propagar o erro caso as credenciais sejam invalidas", async () => {
    await expect(useCase.execute("erro@teste.com", "x")).rejects.toThrow("Authentication failed");
  });
});
