import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Prospecto } from '../src/domain/entities/Prospecto';

interface Props {
  prospecto: Prospecto;
  onClose: () => void;
  onDetails: (id: string) => void;
}

export const ProspectPreviewCard: React.FC<Props> = ({ prospecto, onClose, onDetails }) => {
  const slideAnim = React.useRef(new Animated.Value(200)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const statusColor = prospecto.status.value === 'novo' ? '#2e7d32' : '#64748b';

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.content}>
        <Image 
          source={{ uri: prospecto.photoPath.path }} 
          style={styles.image} 
        />
        
        <View style={styles.info}>
          <View style={[styles.badge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {prospecto.status.value.toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.address} numberOfLines={1}>
            {prospecto.address?.street || 'Localização desconhecida'}, {prospecto.address?.number || ''}
          </Text>
          <Text style={styles.neighborhood} numberOfLines={1}>
            {prospecto.address?.neighborhood || 'Bairro não identificado'}
          </Text>
          
          <TouchableOpacity 
            style={styles.link}
            onPress={() => onDetails(prospecto.id)}
          >
            <Text style={styles.linkText}>Ver detalhes</Text>
            <ChevronRight size={16} color="#2e7d32" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  neighborhood: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
});
