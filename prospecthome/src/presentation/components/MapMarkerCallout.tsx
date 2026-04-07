import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Prospecto } from '../../domain/entities/Prospecto';
import { Callout } from 'react-native-maps';

type Props = {
  prospecto: Prospecto;
  onPress?: (id: string) => void;
};

export function MapMarkerCallout({ prospecto, onPress }: Props) {
  return (
    <Callout tooltip onPress={() => onPress?.(prospecto.id)}>
      <View style={styles.bubble}>
        <Text style={styles.id}>ID: {prospecto.id.substring(0, 10)}</Text>
        <Text style={styles.status}>{prospecto.status.value}</Text>
        <Text style={styles.tap}>Clique para ver detalhe</Text>
      </View>
      <View style={styles.arrowBorder} />
      <View style={styles.arrow} />
    </Callout>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: 150,
  },
  id: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a2a43',
    textTransform: 'capitalize',
  },
  tap: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 6,
    fontStyle: 'italic',
  },
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#e2e8f0',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5,
  },
});
