import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import Cabecalho from '../../components/cabecalho';

type Props = NativeStackScreenProps<RootStackParamList, 'AlterarSenha'>;

type CampoProps = {
  rotulo: string;
  valor: string;
  onChange: (texto: string) => void;
  placeholder: string;
};

function CampoSenha({ rotulo, valor, onChange, placeholder }: CampoProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.campo}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9B9B9B"
          secureTextEntry={!visivel}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setVisivel(!visivel)} hitSlop={10}>
          <Ionicons name={visivel ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9B9B9B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AlterarSenhaScreen({ navigation }: Props) {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');

  function handleAlterar() {
    if (!atual || !nova || !confirmar) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para continuar.');
      return;
    }

    if (nova !== confirmar) {
      Alert.alert('Senhas diferentes', 'A nova senha e a confirmação precisam ser iguais.');
      return;
    }

    // TODO: enviar para a API (PUT /usuarios/me/senha), que confere a senha atual
    Alert.alert('Senha alterada', 'Sua senha foi atualizada.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        <Cabecalho titulo="Alterar Senha" />

        <CampoSenha rotulo="Senha atual" valor={atual} onChange={setAtual} placeholder="Digite a senha atual" />
        <CampoSenha rotulo="Nova senha" valor={nova} onChange={setNova} placeholder="Digite a nova senha" />
        <CampoSenha rotulo="Confirmar nova senha" valor={confirmar} onChange={setConfirmar} placeholder="Repita a nova senha" />
      </View>

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.botao} onPress={handleAlterar}>
          <Text style={styles.botaoTexto}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  conteudo: { flex: 1, padding: 24 },
  grupo: { marginBottom: 16 },
  rotulo: { fontSize: 12, color: '#6B6B6B', marginBottom: 6 },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1B1B1B' },
  rodape: { padding: 24 },
  botao: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});