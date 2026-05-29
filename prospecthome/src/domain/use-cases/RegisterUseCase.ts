import { IAuthGateway } from "../repositories/IAuthGateway";
import { Corretor } from "../entities/Corretor";

export class RegisterUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(email: string, pass: string, name?: string): Promise<{ corretor: Corretor; token: string }> {
    return this.authGateway.register(email, pass, name);
  }
}
