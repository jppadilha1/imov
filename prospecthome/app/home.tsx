import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useAuth } from '../src/presentation/hooks/useAuth';
import { useProspectos } from '../src/presentation/hooks/useProspectos';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { prospectos, loading, syncing, capture, sync, remove } = useProspectos();

  const onLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.nome || user?.email}</Text>
          <Text style={styles.subtitle}>Offline-first sync</Text>
        </View>
        <TouchableOpacity style={styles.btnNav} onPress={onLogout}>
          <Text style={styles.btnNavTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnCapture} onPress={capture}>
          <Text style={styles.btnCaptureTxt}>+ Novo Prospecto (Foto)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnSync} onPress={sync} disabled={syncing}>
          <Text style={styles.btnSyncTxt}>{syncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={prospectos}
        keyExtractor={item => item.id}
        refreshing={loading}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Image source={{ uri: item.photoPath.path }} style={styles.img} />
            <View style={styles.info}>
              <Text>Geo: {item.coordinates.latitude.toFixed(4)}, {item.coordinates.longitude.toFixed(4)}</Text>
              <Text>Status: {item.status.value.toUpperCase()}</Text>
              <Text style={{ color: item.isPending() ? '#f39c12' : '#27ae60' }}>
                Sync: {item.syncStatus.value} {item.remoteId && '(☁)'}
              </Text>
            </View>
            <TouchableOpacity style={styles.btnTrash} onPress={() => remove(item.id)}>
              <Text style={styles.btnTrashTxt}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 24, color: '#aaa'}}>Nenhum prospecto local.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
  },
  header: {
    backgroundColor: '#0a2a43',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#a9b7c6',
    fontSize: 14,
  },
  btnNav: {
    padding: 8,
    backgroundColor: '#1f3b54',
    borderRadius: 6
  },
  btnNavTxt: { color: '#fff' },
  actions: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  btnCapture: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnCaptureTxt: {
    color: '#fff',
    fontWeight: 'bold'
  },
  btnSync: {
    flex: 1,
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnSyncTxt: {
    color: '#fff',
    fontWeight: 'bold'
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2
  },
  img: {
    width: 80,
    height: 80,
    backgroundColor: '#ccc'
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center'
  },
  btnTrash: {
    padding: 20,
    backgroundColor: '#ffeaa7'
  },
  btnTrashTxt: {
    color: '#d35400',
    fontWeight: 'bold'
  }
});
