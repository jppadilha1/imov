import React from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useProspectos } from '../../../src/presentation/hooks/useProspectos';
import { ProspectoCard } from '../../../src/presentation/components/ProspectoCard';
import { router } from 'expo-router';

export default function ListScreen() {
  const { prospectos, loading, refreshing, refresh } = useProspectos();

  const renderItem = ({ item }: any) => (
    <ProspectoCard 
      prospecto={item} 
      onPress={(id) => router.push(`/(tabs)/list/${id}`)} 
    />
  );

  if (loading && prospectos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a2a43" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={prospectos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <Text style={styles.title}>Meus Prospectos</Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum prospecto capturado ainda.</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh} 
            colors={['#0a2a43']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
});
