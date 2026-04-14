import { useEffect } from 'react';
import { SyncProspectosUseCase } from '../src/application/use-cases/SyncProspectosUseCase';
import { container } from '../src/di/container';

export function useSync() {
  const syncUC = new SyncProspectosUseCase(container.syncGateway, container.prospectoRepository);

  useEffect(() => {
    // Escuta mudanças de rede
    const unsubscribe = container.networkService.addListener(async (isConnected) => {
      if (isConnected) {
        console.log("Internet detectada! Sincronizando todos...");
        try {
          await syncUC.execute();
        } catch (e) {
          console.error("Erro no sync automático:", e);
        }
      }
    });

    // Inicia sync na montagem se já estiver com internet
    (async () => {
      const isConnected = await container.networkService.isConnected();
      if (isConnected) await syncUC.execute();
    })();

    return () => unsubscribe();
  }, []);
}
