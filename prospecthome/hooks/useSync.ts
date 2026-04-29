import { useEffect } from 'react';
import { SyncProspectosUseCase } from '../src/application/use-cases/SyncProspectosUseCase';
import { container } from '../src/dependency_injection/container';

export function useSync() {
  useEffect(() => {
    const syncUC = new SyncProspectosUseCase(container.syncGateway, container.prospectoRepository);

    const unsubscribe = container.networkService.addListener(async (isConnected) => {
      if (isConnected) {
        try {
          await syncUC.execute();
        } catch (e) {
          console.error("Erro no sync automático:", e);
        }
      }
    });

    (async () => {
      const isConnected = await container.networkService.isConnected();
      if (isConnected) {
        try {
          await syncUC.execute();
        } catch (e) {
          console.error("Erro no sync inicial:", e);
        }
      }
    })();

    return () => unsubscribe();
  }, []);
}
