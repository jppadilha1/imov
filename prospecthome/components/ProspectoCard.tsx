import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Prospecto } from '../src/domain/entities/Prospecto';
import { SyncBadge } from './SyncBadge';

type Props = {
  prospecto: Prospecto;
  onPress?: (id: string) => void;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  novo: { bg: 'rgba(46, 125, 50, 0.1)', text: '#2e7d32' },
  contatado: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' },
  negociando: { bg: 'rgba(249, 115, 22, 0.1)', text: '#ea580c' },
  fechado: { bg: 'rgba(107, 114, 128, 0.1)', text: '#4b5563' },
};

export function ProspectoCard({ prospecto, onPress }: Props) {
  const statusStyle = STATUS_COLORS[prospecto.status.value] || STATUS_COLORS.novo;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(prospecto.id)}
      activeOpacity={0.7}
    >
      {/* Image section */}
      <Image
        source={{ uri: prospecto.photoPath.path }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Content section */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {prospecto.address?.street || `${prospecto.coordinates.latitude.toFixed(3)}, ${prospecto.coordinates.longitude.toFixed(3)}`}
          </Text>
          <SyncBadge status={prospecto.syncStatus} />
        </View>

        <Text style={styles.subtitle}>
          {prospecto.address?.neighborhood || 'Geolocalização detectada'} • {new Date(prospecto.createdAt).toLocaleDateString('pt-BR')}
        </Text>

        <View style={styles.chipsRow}>
          <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {prospecto.status.value}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.05)',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 16,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
