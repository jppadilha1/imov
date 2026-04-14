import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SyncStatus } from '@/src/domain/value-objects/SyncStatus';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';

type Props = {
  status: SyncStatus;
};

export function SyncBadge({ status }: Props) {
  let label = 'Desconhecido';
  let bgColor = '#f1f5f9';
  let textColor = '#64748b';
  let Icon = Clock;

  if (status.isSynced()) {
    label = 'Sincronizado';
    bgColor = 'rgba(34, 197, 94, 0.1)';
    textColor = '#16a34a';
    Icon = CheckCircle;
  } else if (status.isPending()) {
    label = 'Pendente';
    bgColor = 'rgba(245, 158, 11, 0.1)';
    textColor = '#d97706';
    Icon = Clock;
  } else if (status.isError()) {
    label = 'Erro de Sinc.';
    bgColor = 'rgba(239, 68, 68, 0.1)';
    textColor = '#dc2626';
    Icon = AlertCircle;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Icon size={12} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
