import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { container } from "../../di/container";
import { SyncProspectosUseCase } from "../../domain/use-cases/SyncProspectosUseCase";

export const SYNC_TASK_NAME = 'SyncProspectos';

TaskManager.defineTask(SYNC_TASK_NAME, async () => {
  try {
    const syncUC = new SyncProspectosUseCase(
      container.syncGateway,
      container.prospectoRepository,
      container.geocodeService
    );

    const pendingBefore = await container.prospectoRepository.findPending();
    await syncUC.execute();

    return pendingBefore.length > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
