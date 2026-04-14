import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../hooks/useNetwork';

export function OfflineBanner() {
  const { isConnected } = useNetwork();

  if (isConnected !== false) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Você está offline. As capturas serão salvas localmente.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff9800',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
