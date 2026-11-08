import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  // true = senha visível; false = senha escondida (começa escondida).
  const [mostrarSenha, setMostrarSenha] = useState(false);
  // true enquanto a chamada à API está em andamento (evita toques repetidos).
  const [enviando, setEnviando] = useState(false);
  const { cadastrar } = useAuth();

  async function handleCadastrar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha para continuar.');
      return;
    }

    // A API exige nome com pelo menos 2 caracteres.
    if (nome.trim().length < 2) {
      Alert.alert('Nome curto', 'O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    // A API exige senha com pelo menos 8 caracteres (com menos, daria erro 422).
    if (senha.length < 8) {
      Alert.alert('Senha curta', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setEnviando(true);
    const resultado = await cadastrar(nome, email, senha);
    setEnviando(false);

    if (!resultado.ok) {
      Alert.alert('Não foi possível cadastrar', resultado.erro);
      return;
    }

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

      {/* Campo de senha: o TextInput e o botão do olhinho ficam lado a lado
          dentro de um contêiner que desenha a borda. */}
      <View style={styles.campoSenha}>
        <TextInput
          style={styles.inputSenha}
          placeholder="Senha (mínimo 8 caracteres)"
          placeholderTextColor={colors.placeholder}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!mostrarSenha}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setMostrarSenha(!mostrarSenha)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
        >
          <Ionicons
            name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.botao, enviando && styles.botaoDesabilitado]}
        onPress={handleCadastrar}
        disabled={enviando}
      >
        <Text style={styles.textoBotao}>{enviando ? 'Cadastrando...' : 'Cadastrar'}</Text>
      </TouchableOpacity>

      <View style={styles.blocoLink}>
        <Text style={styles.textoLink}>Já tem uma conta?</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={enviando}>
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
  // Contêiner do campo de senha: tem o mesmo visual dos outros campos.
  campoSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingRight: 14,
    marginBottom: 14,
  },
  // O texto ocupa todo o espaço que sobrar ao lado do ícone.
  inputSenha: {
    flex: 1,
    padding: 14,
    fontSize: 14,
  },
  botao: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
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