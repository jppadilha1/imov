import { useState, useCallback, useEffect } from 'react';
import { container } from '../src/di/container';
import { Prospecto } from '../src/domain/entities/Prospecto';
import { ListProspectosUseCase } from '../src/application/use-cases/ListProspectosUseCase';
import { CaptureProspectoUseCase } from '../src/application/use-cases/CaptureProspectoUseCase';
import { SyncProspectosUseCase } from '../src/application/use-cases/SyncProspectosUseCase';
import { DeleteProspectoUseCase } from '../src/application/use-cases/DeleteProspectoUseCase';
import { useAuth } from './useAuth';

export function useProspectos() {
  const { user } = useAuth();
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const listUC = new ListProspectosUseCase(container.prospectoRepository);
  const captureUC = new CaptureProspectoUseCase(
    container.photoService, 
    container.locationService, 
    container.photoStorage, 
    container.prospectoRepository
  );
  const syncUC = new SyncProspectosUseCase(container.syncGateway, container.prospectoRepository);
  const deleteUC = new DeleteProspectoUseCase(container.prospectoRepository);

  const fetch = useCallback(async () => {
    setLoading(true);
    const list = await listUC.execute();
    setProspectos(list);
    setLoading(false);
  }, []);

  const capture = async () => {
    if (!user) return;
    const novo = await captureUC.execute(user.id);
    if (novo) await fetch();
  };

  const sync = async () => {
    setSyncing(true);
    await syncUC.execute();
    await fetch(); // refresh statuses (remoteId and sync_status)
    setSyncing(false);
  };

  const remove = async (id: string) => {
    await deleteUC.execute(id);
    await fetch();
  };

  useEffect(() => {
    if (user) fetch();
  }, [user]);

  return { prospectos, loading, syncing, fetch, capture, sync, remove };
}
