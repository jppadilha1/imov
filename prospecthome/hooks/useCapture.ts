import { useState } from 'react';
import { container } from '../src/dependency_injection/container';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { CaptureProspectoUseCase } from '../src/application/use-cases/CaptureProspectoUseCase';

export function useCapture() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { requestCameraPermission, requestLocationPermission } = usePermissions();

  const getUseCase = () => new CaptureProspectoUseCase(
    container.photoService,
    container.locationService,
    container.photoStorage,
    container.prospectoRepository
  );

  const capture = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const hasLocation = await requestLocationPermission();
      if (!hasLocation) {
        setLoading(false);
        return null;
      }

      const hasCamera = await requestCameraPermission();
      if (!hasCamera) {
        setLoading(false);
        return null;
      }

      const prospecto = await getUseCase().execute(user.id);
      return prospecto;
    } catch (e: any) {
      setError(e.message || 'Falha na captura');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { capture, loading, error };
}
