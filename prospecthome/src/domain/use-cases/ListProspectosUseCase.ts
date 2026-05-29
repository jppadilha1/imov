import { IProspectoRepository } from "../repositories/IProspectoRepository";
import { Prospecto } from "../entities/Prospecto";

export class ListProspectosUseCase {
  constructor(private readonly prospectoRepo: IProspectoRepository) {}

  async execute(): Promise<Prospecto[]> {
    return this.prospectoRepo.findAll();
  }
}
