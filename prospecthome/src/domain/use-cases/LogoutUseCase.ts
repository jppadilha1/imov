import { IAuthGateway } from "../repositories/IAuthGateway";

export class LogoutUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(): Promise<void> {
    await this.authGateway.logout();
  }
}
