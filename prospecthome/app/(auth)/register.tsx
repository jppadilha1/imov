import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import { Home, Search, Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const { register, user, loading } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/map');
    }
  }, [user]);

  const handleRegister = async () => {
    if (!email || !senha || !nome) return;
    try {
      await register(email, senha, nome);
    } catch (e: any) {
      alert('Erro no registro: ' + e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon Section */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Home size={48} color="#2e7d32" />
            <View style={styles.searchBadge}>
              <Search size={16} color="#2e7d32" />
            </View>
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>ProspectHome</Text>
          <Text style={styles.subtitle}>Crie sua conta de Corretor</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          {/* Name Field */}
          <View style={styles.inputContainer}>
            <User size={22} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              placeholderTextColor="#94a3b8"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Mail size={22} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Lock size={22} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? (
                <EyeOff size={22} color="#94a3b8" />
              ) : (
                <Eye size={22} color="#94a3b8" />
              )}
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>CRIAR CONTA</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <TouchableOpacity
          style={styles.footer}
          onPress={() => router.back()}
        >
          <Text style={styles.footerText}>
            Já tem conta?{' '}
            <Text style={styles.footerBold}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  form: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: 'transparent',
    height: 64,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#0f172a',
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  btn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
  },
  footer: {
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  footerBold: {
    fontWeight: 'bold',
  },
});
