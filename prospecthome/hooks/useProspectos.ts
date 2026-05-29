import { useState, useCallback, useEffect, useMemo } from 'react';
import { container } from '../src/di/container';
import { Prospecto } from '../src/domain/entities/Prospecto';
import { ListProspectosUseCase } from '../src/domain/use-cases/ListProspectosUseCase';
import { CaptureProspectoUseCase } from '../src/domain/use-cases/CaptureProspectoUseCase';
import { DeleteProspectoUseCase } from '../src/domain/use-cases/DeleteProspectoUseCase';
import { useAuth } from './useAuth';

export function useProspectos() {
  const { user } = useAuth();
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCases = useMemo(() => ({
    list: new ListProspectosUseCase(container.prospectoRepository),
    capture: new CaptureProspectoUseCase(
      container.photoService,
      container.locationService,
      container.photoStorage,
      container.prospectoRepository,
      container.geocodeService
    ),
    delete: new DeleteProspectoUseCase(container.prospectoRepository),
  }), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await useCases.list.execute();
      setProspectos(list);
    } catch (e: any) {
      console.error('[useProspectos] fetch failed:', e);
      setError(e?.message ?? 'Falha ao carregar prospectos');
    } finally {
      setLoading(false);
    }
  }, [useCases]);

  const capture = useCallback(async () => {
    if (!user) return null;
    try {
      const novo = await useCases.capture.execute(user.id);
      if (novo) await fetch();
      return novo;
    } catch (e: any) {
      console.error('[useProspectos] capture failed:', e);
      setError(e?.message ?? 'Falha na captura');
      throw e;
    }
  }, [user, useCases, fetch]);

  const remove = useCallback(async (id: string) => {
    try {
      await useCases.delete.execute(id);
      await fetch();
    } catch (e: any) {
      console.error('[useProspectos] remove failed:', e);
      setError(e?.message ?? 'Falha ao remover');
      throw e;
    }
  }, [useCases, fetch]);

  useEffect(() => {
    if (user) fetch();
  }, [user, fetch]);

  return { prospectos, loading, error, fetch, capture, remove };
}
