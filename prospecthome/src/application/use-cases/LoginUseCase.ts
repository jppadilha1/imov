import { IAuthGateway } from "../../domain/repositories/IAuthGateway";
import { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import { Corretor } from "../../domain/entities/Corretor";

export class LoginUseCase {
  constructor(
    private readonly authGateway: IAuthGateway,
    private readonly sessionRepository: ISessionRepository
  ) {}

  async execute(email: string, password: string): Promise<{ corretor: Corretor, token: string }> {
    const result = await this.authGateway.login(email, password);
    await this.sessionRepository.saveSession(result.corretor, result.token);
    return result;
  }
}
