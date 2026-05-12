import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";
import { INetworkService } from "../../domain/repositories/INetworkService";
import { Prospecto } from "../../domain/entities/Prospecto";
import { SyncStatus } from "../../domain/value-objects/SyncStatus";

export class HybridProspectoRepository implements IProspectoRepository {
  constructor(
    private readonly local: IProspectoRepository,
    private readonly remote: IProspectoRepository,
    private readonly network: INetworkService
  ) {}

  async findAll(): Promise<Prospecto[]> {
    const online = await this.network.isConnected();

    if (!online) {
      return this.local.findAll();
    }

    try {
      const remoteResults = await this.remote.findAll();
      for (const prospecto of remoteResults) {
        await this.local.save(prospecto);
      }
      return remoteResults;
    } catch {
      return this.local.findAll();
    }
  }

  async findById(id: string): Promise<Prospecto | null> {
    const online = await this.network.isConnected();

    if (!online) {
      return this.local.findById(id);
    }

    try {
      const result = await this.remote.findById(id);
      if (result) {
        await this.local.save(result);
      }
      return result;
    } catch {
      return this.local.findById(id);
    }
  }

  async save(prospecto: Prospecto): Promise<void> {
    const online = await this.network.isConnected();

    if (!online) {
      const pendingProspecto = this.withSyncStatus(prospecto, SyncStatus.pending());
      await this.local.save(pendingProspecto);
      return;
    }

    try {
      await this.remote.save(prospecto);
      const syncedProspecto = this.withSyncStatus(prospecto, SyncStatus.synced(), prospecto.id);
      await this.local.save(syncedProspecto);
    } catch (err) {
      const pendingProspecto = this.withSyncStatus(prospecto, SyncStatus.pending());
      await this.local.save(pendingProspecto);
      throw err;
    }
  }

  async findPending(): Promise<Prospecto[]> {
    return this.local.findPending();
  }

  async delete(id: string): Promise<void> {
    const online = await this.network.isConnected();

    if (online) {
      try {
        await this.remote.delete(id);
      } catch {
        // Remote delete failure on online: still proceed with local delete
      }
    }

    await this.local.delete(id);
  }

  private withSyncStatus(
    prospecto: Prospecto,
    syncStatus: SyncStatus,
    remoteId: string | null = prospecto.remoteId
  ): Prospecto {
    return Prospecto.reconstruct({
      id: prospecto.id,
      userId: prospecto.userId,
      photoPath: prospecto.photoPath,
      coordinates: prospecto.coordinates,
      address: prospecto.address,
      notes: prospecto.notes,
      status: prospecto.status,
      syncStatus,
      remoteId,
      createdAt: prospecto.createdAt,
    });
  }
}
