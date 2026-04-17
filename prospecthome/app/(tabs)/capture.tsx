import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCapture } from '../../hooks/useCapture';
import { router } from 'expo-router';
import { Camera, MapPin, ArrowLeft } from 'lucide-react-native';

export default function CaptureScreen() {
  const { capture, loading, error } = useCapture();

  const handleCapture = async () => {
    try {
      const prospecto = await capture();
      if (prospecto) {
        router.push('/(tabs)/list');
      }
    } catch (e) {
      // Erro já tratado no hook/alert
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.appBarBtn}
        >
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Nova Captura</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Camera Interaction Area */}
        <View style={styles.cameraArea}>
          <Camera size={80} color="#cbd5e1" />
          <Text style={styles.cameraText}>Toque para fotografar</Text>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {loading ? (
            <View testID="loading-indicator" style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2e7d32" />
              <Text style={styles.loadingText}>Capturando dados e GPS...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.btn}
              onPress={handleCapture}
              activeOpacity={0.85}
            >
              <Camera size={20} color="#fff" />
              <Text style={styles.btnText}>TIRAR FOTO</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appBarBtn: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },
  appBarTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: '500',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  cameraArea: {
    width: 256,
    height: 256,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 8,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 280,
    paddingTop: 16,
  },
  loadingBox: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2e7d32',
    paddingVertical: 18,
    borderRadius: 9999,
    shadowColor: 'rgba(46, 125, 50, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  },
  gpsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
  },
  gpsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
});
