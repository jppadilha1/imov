import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useProspectos } from '../../hooks/useProspectos';
import { useLocation } from '../../hooks/useLocation';
import { useNetwork } from '../../hooks/useNetwork';
import { router } from 'expo-router';
import { RefreshCw, Search, Plus, Minus, Navigation, Home, WifiOff } from 'lucide-react-native';
import { Prospecto } from '../../src/domain/entities/Prospecto';
import { ProspectPreviewCard } from '../../components/ProspectPreviewCard';
import { SearchBar } from '../../components/SearchBar';

export default function MapScreen() {
  const { prospectos, loading: loadingProspects, fetch } = useProspectos();
  const { getCurrentPosition, geocodeAddress, loading: loadingLocation } = useLocation();
  const { isConnected } = useNetwork();
  const [selectedProspect, setSelectedProspect] = React.useState<Prospecto | null>(null);
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  const mapRef = React.useRef<MapView>(null);

  const initialRegion = {
    latitude:
      prospectos.length > 0
        ? prospectos[0].coordinates.latitude
        : -21.5544,
    longitude:
      prospectos.length > 0
        ? prospectos[0].coordinates.longitude
        : -45.4384,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (loadingProspects && prospectos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const handleMarkerPress = (p: Prospecto) => {
    setSelectedProspect(p);
  };

  const handleMapPress = () => {
    setSelectedProspect(null);
  };

  const handleLocationPress = async () => {
    const coords = await getCurrentPosition();
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleSearch = async (query: string) => {
    const coords = await geocodeAddress(query);
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
      setIsSearchVisible(false);
    }
  };

  const handleZoom = async (type: 'in' | 'out') => {
    if (!mapRef.current) return;

    try {
      const camera = await mapRef.current.getCamera();
      if (camera.zoom !== undefined) {
        // Platform: Google Maps (Android / iOS with Google providers)
        camera.zoom += type === 'in' ? 1 : -1;
        mapRef.current.animateCamera(camera, { duration: 500 });
      } else {
        // Platform: Apple Maps (iOS without Google Maps) uses altitude
        camera.altitude = (camera.altitude || 1000) * (type === 'in' ? 0.5 : 2);
        mapRef.current.animateCamera(camera, { duration: 500 });
      }
    } catch (e) {
      console.warn("Could not handle zoom", e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>ProspectHome</Text>
        <TouchableOpacity 
          style={styles.appBarBtn} 
          onPress={() => {
            fetch();
            if (mapRef.current) {
              mapRef.current.animateToRegion(initialRegion, 1000);
            }
          }}
        >
          <RefreshCw size={24} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* Map or Offline Placeholder */}
      {isConnected === false ? (
        <View style={styles.offlinePlaceholder}>
          <WifiOff size={48} color="#94a3b8" />
          <Text style={styles.offlineTitle}>Você está offline</Text>
          <Text style={styles.offlineMessage}>
            Tire suas fotos normalmente, elas serão sincronizadas automaticamente assim que a conexão voltar.
          </Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          {isSearchVisible && (
            <SearchBar
              onSearch={handleSearch}
              onClose={() => setIsSearchVisible(false)}
              loading={loadingLocation}
            />
          )}
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            onPress={handleMapPress}
          >
            {prospectos.map((p) => (
              <Marker
                key={p.id}
                coordinate={{
                  latitude: p.coordinates.latitude,
                  longitude: p.coordinates.longitude,
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMarkerPress(p);
                }}
                tracksViewChanges={false}
              >
                <View style={styles.customMarker}>
                  <Home size={16} color="#ffffff" />
                </View>
              </Marker>
            ))}
          </MapView>

          {selectedProspect && (
            <ProspectPreviewCard
              prospecto={selectedProspect}
              onClose={() => setSelectedProspect(null)}
              onDetails={(id) => router.push(`/(tabs)/list/${id}`)}
            />
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setIsSearchVisible(true)}
            >
              <Search size={20} color="#334155" />
            </TouchableOpacity>

            <View style={styles.zoomGroup}>
              <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('in')}>
                <Plus size={20} color="#334155" />
              </TouchableOpacity>
              <View style={styles.zoomDivider} />
              <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('out')}>
                <Minus size={20} color="#334155" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.controlBtn, loadingLocation && styles.controlBtnDisabled]}
              onPress={handleLocationPress}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#2e7d32" />
              ) : (
                <Navigation size={20} color="#2e7d32" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  controlBtnDisabled: {
    opacity: 0.6,
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
  // Callout styles
  calloutBubble: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  calloutContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  calloutImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  calloutImage: {
    width: 80,
    height: 80,
  },
  calloutInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  calloutChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  calloutChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2e7d32',
    textTransform: 'uppercase',
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 18,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  calloutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  calloutLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },
  offlinePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 40,
    gap: 16,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  offlineMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
