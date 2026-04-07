import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useProspectos } from '../../src/presentation/hooks/useProspectos';
import { MapMarkerCallout } from '../../src/presentation/components/MapMarkerCallout';
import { router } from 'expo-router';

export default function MapScreen() {
  const { prospectos, loading } = useProspectos();

  // Região inicial (ex: SP) ou centrada no primeiro se houver
  const initialRegion = {
    latitude: prospectos.length > 0 ? prospectos[0].coordinates.latitude : -23.5505,
    longitude: prospectos.length > 0 ? prospectos[0].coordinates.longitude : -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (loading && prospectos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a2a43" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Mapa de Imóveis</Text>
      </View>

      <MapView 
        style={styles.map} 
        initialRegion={initialRegion}
      >
        {prospectos.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ 
              latitude: p.coordinates.latitude, 
              longitude: p.coordinates.longitude 
            }}
            pinColor={p.syncStatus.isSynced() ? '#22c55e' : '#f59e0b'}
          >
            <MapMarkerCallout 
              prospecto={p} 
              onPress={(id) => router.push(`/(tabs)/list/${id}`)} 
            />
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Mostrando {prospectos.length} imóveis capturados.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a2a43',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(10, 42, 67, 0.85)',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
