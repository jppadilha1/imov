import { ISyncGateway } from "../../domain/repositories/ISyncGateway";
import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";
import { IGeocodeService } from "../../domain/repositories/IGeocodeService";

export class SyncProspectosUseCase {
  constructor(
    private syncGateway: ISyncGateway,
    private prospectoRepository: IProspectoRepository,
    private geocodeService: IGeocodeService
  ) {}

  async execute(): Promise<void> {
    const pendingItems = await this.prospectoRepository.findPending();
    let userId: string | null = null;

    // Upload pending items
    if (pendingItems.length > 0) {
      userId = pendingItems[0].userId;

      await Promise.allSettled(
        pendingItems.map(async (prospecto) => {
          try {
            if (!prospecto.address) {
              try {
                const address = await this.geocodeService.reverseGeocode(prospecto.coordinates);
                if (address) {
                  prospecto.resolveAddress(address);
                  await this.prospectoRepository.save(prospecto);
                }
              } catch {
                // geocoding failure is non-fatal — proceed with upload without address
              }
            }

            const remoteId = await this.syncGateway.uploadProspecto(prospecto);
            prospecto.markSynced(remoteId);
            await this.prospectoRepository.save(prospecto);
          } catch (e) {
            prospecto.markSyncError();
            await this.prospectoRepository.save(prospecto);
          }
        })
      );
    }

    // Pull updates from Supabase to ensure SQLite is in sync with remote
    if (userId) {
      try {
        const remoteProspectos = await this.syncGateway.pullUpdates(userId, new Date(0));
        for (const prospecto of remoteProspectos) {
          await this.prospectoRepository.save(prospecto);
        }
      } catch {
        // Pull failure is non-fatal — sync is still considered complete
      }
    }
  }
}
