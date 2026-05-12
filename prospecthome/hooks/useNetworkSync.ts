import { useEffect, useRef } from 'react';
import { container } from '../src/dependency_injection/container';
import { SyncProspectosUseCase } from '../src/application/use-cases/SyncProspectosUseCase';

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

    return () => {
      unsubscribe();
    };
  }, []);
}
