import { RegisterUseCase } from "../../../../src/domain/use-cases/RegisterUseCase";
import { MockAuthGateway } from "../../../../src/infra/mock/MockAuthGateway";

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let authGateway: MockAuthGateway;

  beforeEach(() => {
    authGateway = new MockAuthGateway();
    useCase = new RegisterUseCase(authGateway);
  });

  it("deve registrar um novo corretor via authGateway", async () => {
    const spyRegister = jest.spyOn(authGateway, "register");
    const result = await useCase.execute("novo@teste.com", "senha123", "Novo Nome");

    expect(spyRegister).toHaveBeenCalledWith("novo@teste.com", "senha123", "Novo Nome");
    expect(result.corretor.email).toBe("novo@teste.com");
    expect(result.corretor.nome).toBe("Novo Nome");
    expect(result.token).toBeTruthy();
  });

  it("deve falhar se gateway lancar erro", async () => {
    jest.spyOn(authGateway, "register").mockRejectedValue(new Error("User exists"));
    await expect(useCase.execute("e@e.com", "p", "n")).rejects.toThrow("User exists");
  });
});
