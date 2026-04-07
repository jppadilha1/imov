import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProspectoDetail } from '../../../src/presentation/hooks/useProspectoDetail';
import { SyncBadge } from '../../../src/presentation/components/SyncBadge';
import { StatusSelector } from '../../../src/presentation/components/StatusSelector';
import { ChevronLeft } from 'lucide-react-native';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { prospecto, loading, updateStatus } = useProspectoDetail(id);

  if (loading || !prospecto) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a2a43" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0a2a43" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhe do Prospecto</Text>
      </View>

      <Image source={{ uri: prospecto.photoPath }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ID completo:</Text>
          <Text style={styles.value}>{prospecto.id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Sincronização:</Text>
          <SyncBadge status={prospecto.syncStatus} />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Criado em:</Text>
          <Text style={styles.value}>
            {new Date(prospecto.createdAt).toLocaleDateString()} {new Date(prospecto.createdAt).toLocaleTimeString()}
          </Text>
        </View>

        <StatusSelector currentStatus={prospecto.status} onChange={updateStatus} />
        
        {prospecto.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.label}>Notas:</Text>
            <Text style={styles.notesText}>{prospecto.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#cbd5e1',
  },
  content: {
    padding: 20,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
  },
  notesBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
});
