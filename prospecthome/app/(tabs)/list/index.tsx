import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProspectos } from '../../../hooks/useProspectos';
import { ProspectoCard } from '../../../components/ProspectoCard';
import { router } from 'expo-router';
import { Search, RefreshCw } from 'lucide-react-native';

export default function ListScreen() {
  const { prospectos, loading, syncing, fetch } = useProspectos();

  const pendingCount = prospectos.filter(p => p.syncStatus.isPending()).length;

  const renderItem = ({ item }: any) => (
    <ProspectoCard
      prospecto={item}
      onPress={(id) => router.push(`/(tabs)/list/${id}`)}
    />
  );

  if (loading && prospectos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft} />
        <View style={styles.appBarRight}>
          <TouchableOpacity style={styles.appBarBtn}>
            <Search size={24} color="#334155" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={prospectos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <>
            {/* Sync Status Banner */}
            {pendingCount > 0 && (
              <View style={styles.syncBanner}>
                <RefreshCw size={18} color="#d97706" />
                <Text style={styles.syncBannerText}>
                  🔄 {pendingCount} pendentes de sincronização
                </Text>
              </View>
            )}
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Nenhum prospecto capturado ainda.
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={fetch}
            colors={['#2e7d32']}
            tintColor="#2e7d32"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f6',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 125, 50, 0.1)',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appBarBtn: {
    padding: 8,
    borderRadius: 20,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8f6',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  syncBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
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
