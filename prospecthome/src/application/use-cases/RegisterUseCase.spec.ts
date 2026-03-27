import { RegisterUseCase } from "./RegisterUseCase";
import { MockAuthGateway } from "../../infrastructure/mock/MockAuthGateway";
import { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import { Corretor } from "../../domain/entities/Corretor";

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let authGateway: MockAuthGateway;
  let sessionRepo: ISessionRepository;

  beforeEach(() => {
    authGateway = new MockAuthGateway();
    sessionRepo = {
      saveSession: jest.fn(),
      getSession: jest.fn(),
      clearSession: jest.fn()
    } as any;
    
    useCase = new RegisterUseCase(authGateway, sessionRepo);
  });

  it("call to action: deve registrar um novo corretor e salvar sessao", async () => {
    const spyRegister = jest.spyOn(authGateway, "register");
    const result = await useCase.execute("novo@teste.com", "senha123", "Novo Nome");

    expect(spyRegister).toHaveBeenCalledWith("novo@teste.com", "senha123", "Novo Nome");
    expect(sessionRepo.saveSession).toHaveBeenCalledWith(result.corretor, result.token);
    expect(result.corretor.email).toBe("novo@teste.com");
    expect(result.corretor.nome).toBe("Novo Nome");
  });

  it("deve falhar se gateway lancar erro", async () => {
    jest.spyOn(authGateway, "register").mockRejectedValue(new Error("User exists"));
    await expect(useCase.execute("e@e.com", "p", "n")).rejects.toThrow("User exists");
  });
});
