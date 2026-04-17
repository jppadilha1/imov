import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";
import { Prospecto } from "../../domain/entities/Prospecto";
import { Coordinates } from "../../domain/value-objects/Coordinates";
import { Address } from "../../domain/value-objects/Address";
import { PhotoPath } from "../../domain/value-objects/PhotoPath";
import { ProspectoStatus } from "../../domain/value-objects/ProspectoStatus";
import { SyncStatus } from "../../domain/value-objects/SyncStatus";

export class MockProspectoRepository implements IProspectoRepository {
  private prospectos: Prospecto[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const p1 = Prospecto.reconstruct({
      id: "p1",
      userId: "u123",
      photoPath: new PhotoPath("https://picsum.photos/seed/p1/400/300.jpg"), // Mock image
      coordinates: new Coordinates(-21.558, -45.438),
      address: new Address("Avenida dos Imigrantes", "1000", "Bairro Vargem", "Varginha", "MG", "37000-000"),
      notes: "Ótima oportunidade na Avenida dos Imigrantes",
      status: ProspectoStatus.novo(),
      syncStatus: SyncStatus.synced(),
      remoteId: "rem-p1",
      createdAt: new Date(),
    });

    const p2 = Prospecto.reconstruct({
      id: "p2",
      userId: "u123",
      photoPath: new PhotoPath("https://picsum.photos/seed/p2/400/300.jpg"),
      coordinates: new Coordinates(-21.554, -45.438),
      address: new Address("Rua Abraaão Caineli", "S/N", "Centro", "Varginha", "MG", "37000-000"),
      notes: "Perto do centro de Varginha",
      status: ProspectoStatus.contatado(),
      syncStatus: SyncStatus.synced(),
      remoteId: "rem-p2",
      createdAt: new Date(),
    });

    this.prospectos = [p1, p2];
  }

  async save(prospecto: Prospecto): Promise<void> {
    const index = this.prospectos.findIndex(p => p.id === prospecto.id);
    if (index >= 0) {
      this.prospectos[index] = prospecto;
    } else {
      this.prospectos.push(prospecto);
    }
  }

  async findById(id: string): Promise<Prospecto | null> {
    return this.prospectos.find(p => p.id === id) || null;
  }

  async findAll(): Promise<Prospecto[]> {
    return [...this.prospectos];
  }

  async findPending(): Promise<Prospecto[]> {
    return this.prospectos.filter(p => p.isPending());
  }

  async delete(id: string): Promise<void> {
    this.prospectos = this.prospectos.filter(p => p.id !== id);
  }
}
