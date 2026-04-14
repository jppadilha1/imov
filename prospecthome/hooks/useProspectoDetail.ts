import { useState, useEffect } from 'react';
import { container } from '../src/di/container';
import { Prospecto } from '../src/domain/entities/Prospecto';
import { ProspectoStatus } from '../src/domain/value-objects/ProspectoStatus';

export function useProspectoDetail(id: string) {
  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const item = await container.prospectoRepository.findById(id);
    setProspecto(item);
    setLoading(false);
  };

  const updateStatus = async (value: 'novo' | 'contatado' | 'negociando' | 'fechado') => {
    if (!prospecto) return;
    try {
      // Manual transition to verify VO constraints if needed, or reconstruct
      // For speed in MVP, we might just reconstruct with new status
      const updated = Prospecto.reconstruct({
        ...prospecto,
        status: new ProspectoStatus(value),
        address: prospecto.address,
        notes: prospecto.notes,
        syncStatus: prospecto.syncStatus,
        remoteId: prospecto.remoteId,
        createdAt: prospecto.createdAt
      });
      await container.prospectoRepository.save(updated);
      setProspecto(updated);
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    if (id) fetch();
  }, [id]);

  return { prospecto, loading, fetch, updateStatus };
}
