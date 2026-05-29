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
      const updated = Prospecto.reconstruct({
        id: prospecto.id,
        userId: prospecto.userId,
        photoPath: prospecto.photoPath,
        coordinates: prospecto.coordinates,
        address: prospecto.address,
        notes: prospecto.notes,
        status: new ProspectoStatus(value),
        syncStatus: prospecto.syncStatus,
        remoteId: prospecto.remoteId,
        createdAt: prospecto.createdAt,
      });
      updated.markDirty();
      await container.prospectoRepository.save(updated);
      setProspecto(updated);
    } catch (e) {
      alert(`Erro ao atualizar status: ${e}`);
    }
  };

  const updateNotes = async (text: string) => {
    if (!prospecto) return;
    try {
      const updated = Prospecto.reconstruct({
        id: prospecto.id,
        userId: prospecto.userId,
        photoPath: prospecto.photoPath,
        coordinates: prospecto.coordinates,
        address: prospecto.address,
        notes: text,
        status: prospecto.status,
        syncStatus: prospecto.syncStatus,
        remoteId: prospecto.remoteId,
        createdAt: prospecto.createdAt,
      });
      updated.markDirty();
      await container.prospectoRepository.save(updated);
      setProspecto(updated);
    } catch (e) {
      alert(`Erro ao atualizar notas: ${e}`);
    }
  };

  useEffect(() => {
    if (id) fetch();
  }, [id]);

  return { prospecto, loading, fetch, updateStatus, updateNotes };
}
