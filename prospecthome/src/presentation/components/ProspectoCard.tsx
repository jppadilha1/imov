import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Prospecto } from '../../domain/entities/Prospecto';
import { SyncBadge } from './SyncBadge';

type Props = {
  prospecto: Prospecto;
  onPress?: (id: string) => void;
};

export function ProspectoCard({ prospecto, onPress }: Props) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress?.(prospecto.id)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: prospecto.photoPath.path }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.id}>ID: {prospecto.id.substring(0, 10)}...</Text>
          <SyncBadge status={prospecto.syncStatus} />
        </View>
        
        <Text style={styles.status}>{prospecto.status.value}</Text>
        <Text style={styles.date}>
          {new Date(prospecto.createdAt).toLocaleDateString()} {new Date(prospecto.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  id: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
});
