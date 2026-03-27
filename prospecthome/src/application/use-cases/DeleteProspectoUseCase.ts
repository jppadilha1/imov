import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";

export class DeleteProspectoUseCase {
  constructor(private readonly prospectoRepo: IProspectoRepository) {}

  async execute(id: string): Promise<void> {
    await this.prospectoRepo.delete(id);
  }
}
