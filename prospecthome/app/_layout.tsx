import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNetworkSync } from '../hooks/useNetworkSync';

function AppStack() {
  useNetworkSync();
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppStack />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
