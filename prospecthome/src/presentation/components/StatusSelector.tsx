import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProspectoStatus } from '../../domain/value-objects/ProspectoStatus';

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
      <Text style={styles.label}>Alterar Status:</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const isActive = currentStatus.value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.btn, isActive && styles.btnActive]}
              onPress={() => onChange(opt)}
            >
              <Text style={[styles.btnText, isActive && styles.btnTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnActive: {
    backgroundColor: '#0a2a43',
    borderColor: '#0a2a43',
  },
  btnText: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  btnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
