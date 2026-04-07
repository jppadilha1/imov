import { IAuthGateway } from "../../domain/repositories/IAuthGateway";
import { Corretor } from "../../domain/entities/Corretor";

export class MockAuthGateway implements IAuthGateway {
  async login(email: string, pass: string): Promise<{ corretor: Corretor; token: string }> {
    if (email === "erro@teste.com") {
      throw new Error("Authentication failed");
    }
    const corretor = Corretor.create({ id: "u123", email, nome: "João do Imóvel" });
    return { corretor, token: "mock-jwt-token" };
  }

  async register(email: string, pass: string, name?: string): Promise<{ corretor: Corretor; token: string }> {
    if (email === "existe@teste.com") {
      throw new Error("User exists");
    }
    const corretor = Corretor.create({ id: "u" + Date.now().toString(), email, nome: name });
    return { corretor, token: "mock-jwt-token-new" };
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }

  async refreshToken(token: string): Promise<{ corretor: Corretor; token: string }> {
    const corretor = Corretor.create({ id: "u123", email: "jao@b.com" });
    return { corretor, token: "new-mock-jwt-token" };
  }
}
