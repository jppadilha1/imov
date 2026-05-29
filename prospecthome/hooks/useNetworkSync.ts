import { useEffect, useRef } from 'react';
import * as BackgroundFetch from 'expo-background-fetch';

import '../src/infra/services/syncTask';
import { container } from '../src/di/container';
import { SyncProspectosUseCase } from '../src/domain/use-cases/SyncProspectosUseCase';

const SYNC_TASK_NAME = 'SyncProspectos';
const SYNC_MIN_INTERVAL_SECONDS = 15 * 60;

export function useNetworkSync() {
  const syncInFlight = useRef(false);
  const wasOnline = useRef<boolean | null>(null);

  useEffect(() => {
    const syncUC = new SyncProspectosUseCase(
      container.syncGateway,
      container.prospectoRepository,
      container.geocodeService
    );

    const runSync = async () => {
      if (syncInFlight.current) return;
      syncInFlight.current = true;
      try {
        await syncUC.execute();
      } catch {
        // sync failure non-fatal
      } finally {
        syncInFlight.current = false;
      }
    };

    container.networkService.isConnected().then((connected) => {
      wasOnline.current = connected;
      if (connected) runSync();
    });

    const unsubscribe = container.networkService.addListener((isConnected) => {
      const prevOnline = wasOnline.current;
      wasOnline.current = isConnected;

      if (isConnected && prevOnline === false) {
        runSync();
      }
    });

    try {
      BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
        minimumInterval: SYNC_MIN_INTERVAL_SECONDS,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch {
      // BackgroundFetch unavailable (Expo Go) — foreground sync still works
    }

    return () => {
      unsubscribe();
      try {
        BackgroundFetch.unregisterTaskAsync(SYNC_TASK_NAME);
      } catch {
        // task may not be registered
      }
    };
  }, []);
}
