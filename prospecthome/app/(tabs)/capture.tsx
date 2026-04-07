import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCapture } from '../../src/presentation/hooks/useCapture';
import { OfflineBanner } from '../../src/presentation/components/OfflineBanner';
import { router } from 'expo-router';
import { Camera } from 'lucide-react-native';

export default function CaptureScreen() {
  const { capture, loading, error } = useCapture();

  const handleCapture = async () => {
    try {
      const prospecto = await capture();
      if (prospecto) {
        // Redireciona para a lista após sucesso
        router.push('/list');
      }
    } catch (e) {
      // Erro já tratado no hook/alert
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Camera size={80} color="#0a2a43" />
        </View>
        
        <Text style={styles.title}>Nova Prospecção</Text>
        <Text style={styles.subtitle}>
          Pressione o botão abaixo para abrir a câmera e capturar a fachada do imóvel.
        </Text>

        {loading ? (
          <View testID="loading-indicator" style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0a2a43" />
            <Text style={styles.loadingText}>Capturando dados e GPS...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.btn} 
            onPress={handleCapture}
          >
            <Text style={styles.btnText}>CAPTURAR IMÓVEL</Text>
          </TouchableOpacity>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: '#f0f4f8',
    padding: 30,
    borderRadius: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2a43',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c7a89',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loadingBox: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#0a2a43',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#0a2a43',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#0a2a43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    color: '#e53e3e',
    marginTop: 16,
    textAlign: 'center',
  },
});
