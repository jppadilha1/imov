import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProspectoStatus } from '../src/domain/value-objects/ProspectoStatus';
import { CheckCircle } from 'lucide-react-native';

type Props = {
  currentStatus: ProspectoStatus;
  onChange: (value: 'novo' | 'contatado' | 'negociando' | 'fechado') => void;
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  novo: { bg: '#e8f5e9', border: '#2e7d32', text: '#2e7d32' },
  contatado: { bg: '#e3f2fd', border: '#1565c0', text: '#1565c0' },
  negociando: { bg: '#fff3e0', border: '#e65100', text: '#e65100' },
  fechado: { bg: '#eceff1', border: '#546e7a', text: '#546e7a' },
};

export function StatusSelector({ currentStatus, onChange }: Props) {
  const options: ('novo' | 'contatado' | 'negociando' | 'fechado')[] = [
    'novo', 'contatado', 'negociando', 'fechado'
  ];

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = currentStatus.value === opt;
        const color = STATUS_COLORS[opt];
        const chipBg = isActive ? color.border : color.bg;
        const textColor = isActive ? '#fff' : color.text;

        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.chip,
              {
                backgroundColor: chipBg,
                borderColor: color.border,
              },
            ]}
            onPress={() => onChange(opt)}
            activeOpacity={0.7}
          >
            {isActive && <CheckCircle size={16} color="#fff" />}
            <Text style={[styles.chipText, { color: textColor }]}>
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
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
