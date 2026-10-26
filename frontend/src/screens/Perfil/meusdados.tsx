import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import Cabecalho from '../../components/cabecalho';

type Props = NativeStackScreenProps<RootStackParamList, 'MeusDados'>;

export default function MeusDadosScreen({ navigation }: Props) {
  const [nome, setNome] = useState('Usuário Exemplo');
  const [email, setEmail] = useState('usuario@email.com');

  const iniciais = nome
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function handleSalvar() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome e e-mail para continuar.');
      return;
    }

    // TODO: enviar para a API (PUT /usuarios/me)
    Alert.alert('Dados atualizados', 'Suas informações foram salvas.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        <Cabecalho titulo="Meus Dados" />

        <View style={styles.areaAvatar}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciais}</Text>
          </View>
        </View>

        <Text style={styles.rotulo}>Nome completo</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} />

        <Text style={styles.rotulo}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
          <Text style={styles.botaoTexto}>Salvar Alterações</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  conteudo: { flex: 1, padding: 24 },
  areaAvatar: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1F3864',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontSize: 24, fontWeight: '600', color: '#FFFFFF' },
  rotulo: { fontSize: 12, color: '#6B6B6B', marginBottom: 6 },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1B1B1B',
    marginBottom: 16,
  },
  rodape: { padding: 24 },
  botao: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});