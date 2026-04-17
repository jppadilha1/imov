import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
  } | null;
  errorMsg: string | null;
  loading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    errorMsg: null,
    loading: false,
  });

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(s => ({ ...s, errorMsg: 'Permissão de localização negada' }));
        return false;
      }
      return true;
    } catch (error) {
      setState(s => ({ ...s, errorMsg: 'Erro ao solicitar permissão' }));
      return false;
    }
  }, []);

  const getCurrentPosition = useCallback(async () => {
    setState(s => ({ ...s, loading: true, errorMsg: null }));
    
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState(s => ({ ...s, loading: false }));
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setState({
        coords: newCoords,
        errorMsg: null,
        loading: false,
      });

      return newCoords;
    } catch (error) {
      const msg = 'Não foi possível obter a localização atual';
      setState(s => ({ ...s, errorMsg: msg, loading: false }));
      Alert.alert('Erro', msg);
      return null;
    }
  }, [requestPermission]);

  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim()) return null;
    
    setState(s => ({ ...s, loading: true, errorMsg: null }));
    try {
      const [result] = await Location.geocodeAsync(address);
      if (result) {
        setState(s => ({ ...s, loading: false }));
        return {
          latitude: result.latitude,
          longitude: result.longitude,
        };
      }
      
      setState(s => ({ ...s, loading: false, errorMsg: 'Endereço não encontrado' }));
      return null;
    } catch (error) {
      setState(s => ({ ...s, loading: false, errorMsg: 'Erro ao buscar endereço' }));
      return null;
    }
  }, []);

  return {
    ...state,
    getCurrentPosition,
    geocodeAddress,
    requestPermission,
  };
}
