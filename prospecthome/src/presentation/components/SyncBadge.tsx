import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SyncStatus } from '@/src/domain/value-objects/SyncStatus';

type Props = {
  status: SyncStatus;
};

export function SyncBadge({ status }: Props) {
  let label = 'Desconhecido';
  let bgColor = '#cbd5e1';

  if (status.isSynced()) {
    label = 'Sincronizado';
    bgColor = '#22c55e';
  } else if (status.isPending()) {
    label = 'Pendente';
    bgColor = '#f59e0b';
  } else if (status.isError()) {
    label = 'Erro de Sinc.';
    bgColor = '#ef4444';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
