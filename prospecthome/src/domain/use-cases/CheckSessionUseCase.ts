import { IAuthGateway } from "../repositories/IAuthGateway";
import { Corretor } from "../entities/Corretor";

export class CheckSessionUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(): Promise<{ corretor: Corretor; token: string } | null> {
    return this.authGateway.getSession();
  }
}
