import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha para continuar.');
      return;
    }

    // TODO: aqui vai entrar a chamada de autenticação do Firebase
    console.log('Tentando entrar com:', { email, senha });
    Alert.alert('Login', `Simulando login com o e-mail: ${email}`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>CashFlow</Text>
      <Text style={styles.subtitulo}>Entre para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#9B9B9B"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9B9B9B"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.botao} onPress={handleEntrar}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#1F3864',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 14,
  },
  botao: {
    backgroundColor: '#1F3864',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  link: {
    color: '#1F3864',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});