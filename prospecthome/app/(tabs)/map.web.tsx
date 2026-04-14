import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProspectos } from '../../hooks/useProspectos';
import { RefreshCw, Search, Plus, Minus, Navigation } from 'lucide-react-native';

export default function MapScreen() {
  const { prospectos, loading } = useProspectos();

  if (loading && prospectos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>ProspectHome</Text>
        <TouchableOpacity style={styles.appBarBtn}>
          <RefreshCw size={24} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* Map Fallback for Web */}
      <View style={styles.mapContainer}>
        <View style={styles.webFallbackContainer}>
          <Text style={styles.webFallbackTitle}>Mapa indisponível na Web</Text>
          <Text style={styles.webFallbackText}>
            A biblioteca react-native-maps requer integração nativa (iOS/Android).
            Para testar a funcionalidade do mapa, abra o app no emulador ou dispositivo físico usando o Expo Go.
          </Text>
          <Text style={styles.webFallbackText}>
            Prospectos retornados: {prospectos.length}
          </Text>
        </View>

        {/* Floating Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn}>
            <Search size={20} color="#334155" />
          </TouchableOpacity>

          <View style={styles.zoomGroup}>
            <TouchableOpacity style={styles.zoomBtn}>
              <Plus size={20} color="#334155" />
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomBtn}>
              <Minus size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.controlBtn}>
            <Navigation size={20} color="#2e7d32" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    backgroundColor: '#fff',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    letterSpacing: -0.3,
  },
  appBarBtn: {
    padding: 8,
    borderRadius: 20,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e2e8f0',
  },
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  webFallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  webFallbackText: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  controlBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
});
