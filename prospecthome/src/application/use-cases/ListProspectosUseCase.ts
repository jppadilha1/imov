import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";
import { Prospecto } from "../../domain/entities/Prospecto";

export class ListProspectosUseCase {
  constructor(private readonly prospectoRepo: IProspectoRepository) {}

  async execute(): Promise<Prospecto[]> {
    return this.prospectoRepo.findAll();
  }
}
