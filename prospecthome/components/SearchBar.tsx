import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onChangeText?: (text: string) => void;
  onClose: () => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchBar({ onSearch, onChangeText, onClose, loading, placeholder = "Buscar endereço..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const handleTextChange = (text: string) => {
    setQuery(text);
    onChangeText?.(text);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch?.(query);
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <View style={styles.inputWrapper}>
        <Search size={20} color="#64748b" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSubmit}
          autoFocus
          returnKeyType="search"
        />
        {loading ? (
          <ActivityIndicator size="small" color="#2e7d32" style={styles.loader} />
        ) : (
          query.length > 0 && (
            <TouchableOpacity onPress={() => handleTextChange('')}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          )
        )}
      </View>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    gap: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    paddingVertical: 8,
  },
  loader: {
    marginLeft: 8,
  },
  closeBtn: {
    paddingHorizontal: 4,
  },
  closeText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
  },
});
