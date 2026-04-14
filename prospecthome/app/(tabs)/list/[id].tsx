import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useProspectoDetail } from '../../../hooks/useProspectoDetail';
import { StatusSelector } from '../../../components/StatusSelector';
import {
  ArrowLeft,
  MoreVertical,
  Calendar,
  MapPin,
  RefreshCw,
} from 'lucide-react-native';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { prospecto, loading, updateStatus } = useProspectoDetail(id);

  if (loading || !prospecto) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const syncLabel = prospecto.syncStatus.isSynced()
    ? 'Sincronizado ✅'
    : prospecto.syncStatus.isPending()
    ? 'Pendente ⏳'
    : 'Erro ❌';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.appBarBtn}
          >
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Detalhes</Text>
        </View>
        <TouchableOpacity style={styles.appBarBtn}>
          <MoreVertical size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: prospecto.photoPath.path }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <Text style={styles.title}>
            {prospecto.address?.street || `${prospecto.coordinates.latitude.toFixed(4)}, ${prospecto.coordinates.longitude.toFixed(4)}`}
          </Text>
          <Text style={styles.neighborhood}>
            {prospecto.address?.neighborhood || 'Localização detectada'}
          </Text>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STATUS</Text>
          <StatusSelector
            currentStatus={prospecto.status}
            onChange={updateStatus}
          />
        </View>

        {/* Description / Notes */}
        {prospecto.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DESCRIÇÃO</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{prospecto.notes}</Text>
            </View>
          </View>
        )}

        {/* Info List */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFORMAÇÕES</Text>
          <View style={styles.infoList}>
            {/* Date */}
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color="#2e7d32" />
              </View>
              <View>
                <Text style={styles.infoValue}>
                  {new Date(prospecto.createdAt).toLocaleDateString('pt-BR')}{' '}
                  às{' '}
                  {new Date(prospecto.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.infoSubtext}>Data de registro</Text>
              </View>
            </View>

            <View style={styles.infoSeparator} />

            {/* Coordinates */}
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <MapPin size={20} color="#2e7d32" />
              </View>
              <View>
                <Text style={styles.infoValue}>
                  {prospecto.coordinates.latitude.toFixed(4)},{' '}
                  {prospecto.coordinates.longitude.toFixed(4)}
                </Text>
                <Text style={styles.infoSubtext}>Coordenadas GPS</Text>
              </View>
            </View>

            <View style={styles.infoSeparator} />

            {/* Sync Status */}
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <RefreshCw size={20} color="#2e7d32" />
              </View>
              <View>
                <Text style={styles.infoValue}>{syncLabel}</Text>
                <Text style={styles.infoSubtext}>Status na nuvem</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f6',
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8f6',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 125, 50, 0.1)',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  appBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  imageContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 16,
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
  },
  basicInfo: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 28,
  },
  neighborhood: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 12,
  },
  notesBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.05)',
  },
  notesText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  infoList: {
    gap: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
  },
});
