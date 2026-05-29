import { IAuthGateway } from "../repositories/IAuthGateway";
import { Corretor } from "../entities/Corretor";

export class LoginUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(email: string, password: string): Promise<{ corretor: Corretor, token: string }> {
    return this.authGateway.login(email, password);
  }
}
