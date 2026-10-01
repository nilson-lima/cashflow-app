import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function handleCadastrar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha para continuar.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Senha curta', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // TODO: salvar usuário (autenticação simulada)
    Alert.alert('Conta criada!', 'Agora é só entrar com seu e-mail e senha.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>CashFlow</Text>
      <Text style={styles.subtitulo}>Crie sua conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        placeholderTextColor={colors.placeholder}
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={colors.placeholder}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.botao} onPress={handleCadastrar}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <View style={styles.blocoLink}>
        <Text style={styles.textoLink}>Já tem uma conta?</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 29,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 14,
  },
  botao: {
    backgroundColor: colors.primary,
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
  blocoLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  textoLink: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  link: {
    fontSize: 13,
    color: colors.link,
    fontWeight: '600',
    marginTop: 2,
  },
});