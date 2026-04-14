import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProspectoStatus } from '../src/domain/value-objects/ProspectoStatus';
import { CheckCircle } from 'lucide-react-native';

type Props = {
  currentStatus: ProspectoStatus;
  onChange: (value: 'novo' | 'contatado' | 'negociando' | 'fechado') => void;
};

export function StatusSelector({ currentStatus, onChange }: Props) {
  const options: ('novo' | 'contatado' | 'negociando' | 'fechado')[] = [
    'novo', 'contatado', 'negociando', 'fechado'
  ];

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = currentStatus.value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            {isActive && (
              <CheckCircle size={16} color="#fff" />
            )}
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
  },
  chipActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  chipTextActive: {
    color: '#fff',
  },
});
