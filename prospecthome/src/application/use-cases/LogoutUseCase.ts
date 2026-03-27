import { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import { IAuthGateway } from "../../domain/repositories/IAuthGateway";

export class LogoutUseCase {
  constructor(
    private readonly authGateway: IAuthGateway,
    private readonly sessionRepo: ISessionRepository
  ) {}

  async execute(): Promise<void> {
    await this.authGateway.logout();
    await this.sessionRepo.clearSession();
  }
}
