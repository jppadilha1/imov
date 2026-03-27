import { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import { Corretor } from "../../domain/entities/Corretor";

export class CheckSessionUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(): Promise<{ corretor: Corretor; token: string } | null> {
    return this.sessionRepo.getSession();
  }
}
