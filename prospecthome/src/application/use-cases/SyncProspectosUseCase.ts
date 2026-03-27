import { ISyncGateway } from "../../domain/repositories/ISyncGateway";
import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";

export class SyncProspectosUseCase {
  constructor(
    private syncGateway: ISyncGateway,
    private prospectoRepository: IProspectoRepository
  ) {}

  async execute(): Promise<void> {
    const pendingItems = await this.prospectoRepository.findPending();

    if (pendingItems.length === 0) return;

    // Use Promise.allSettled for individual error boundaries (one failing sync shouldn't crash the whole loop array abruptly)
    await Promise.allSettled(
      pendingItems.map(async (prospecto) => {
        try {
          const remoteId = await this.syncGateway.uploadProspecto(prospecto);
          prospecto.markSynced(remoteId);
          await this.prospectoRepository.save(prospecto);
        } catch (e) {
          prospecto.markSyncError();
          await this.prospectoRepository.save(prospecto);
          // Logs omitted currently
        }
      })
    );
  }
}
