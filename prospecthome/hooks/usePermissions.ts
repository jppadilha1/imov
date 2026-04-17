import { useCallback } from 'react';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export function usePermissions() {
  const requestLocationPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status === 'granted') return true;
    
    const { status: newStatus, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    if (newStatus === 'granted') return true;
    
    if (!canAskAgain) {
      Alert.alert(
        'Permissão Necessária',
        'A permissão de localização foi negada permanentemente. Por favor, habilite-a nas configurações do sistema.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurações', onPress: () => Linking.openSettings() }
        ]
      );
    }
    
    return false;
  }, []);

  const requestCameraPermission = useCallback(async () => {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    
    if (status === 'granted') return true;
    
    const { status: newStatus, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (newStatus === 'granted') return true;
    
    if (!canAskAgain) {
      Alert.alert(
        'Permissão Necessária',
        'A permissão de câmera foi negada permanentemente. Por favor, habilite-a nas configurações do sistema.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurações', onPress: () => Linking.openSettings() }
        ]
      );
    }
    
    return false;
  }, []);

  return {
    requestLocationPermission,
    requestCameraPermission,
  };
}
