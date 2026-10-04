import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Perfil'>;

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

const ITENS: { icone: keyof typeof Ionicons.glyphMap; rotulo: string }[] = [
  { icone: 'person-outline', rotulo: 'Meus Dados' },
  { icone: 'lock-closed-outline', rotulo: 'Alterar Senha' },
  { icone: 'notifications-outline', rotulo: 'Notificações' },
  { icone: 'pricetag-outline', rotulo: 'Categorias' },
];

export default function PerfilScreen({ navigation }: Props) {
  const { usuario, sair } = useAuth();

  if (!usuario) return null;

  // TODO: implementar estas telas quando forem definidas no projeto
  function itemEmBreve(rotulo: string) {
    Alert.alert('Em breve', `"${rotulo}" ainda não foi implementado.`);
  }

  function handleSair() {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await sair();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.titulo}>Perfil</Text>
        <Text style={styles.subtitulo}>Gerencie sua conta e preferências</Text>

        <View style={styles.blocoUsuario}>
          <View style={styles.avatar}>
            <Text style={styles.textoAvatar}>{iniciais(usuario.nome)}</Text>
          </View>
          <Text style={styles.nome}>{usuario.nome}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
        </View>

        {ITENS.map((item) => (
          <TouchableOpacity
            key={item.rotulo}
            style={styles.item}
            onPress={() => itemEmBreve(item.rotulo)}
          >
            <Ionicons name={item.icone} size={18} color={colors.primary} />
            <Text style={styles.rotuloItem}>{item.rotulo}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.placeholder} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.botaoSair} onPress={handleSair}>
          <Ionicons name="log-out-outline" size={18} color={colors.expense} />
          <Text style={styles.textoSair}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomBar ativo="Perfil" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 48, paddingBottom: 24 },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subtitulo: { fontSize: 12, color: colors.textSecondary, marginBottom: 20 },
  blocoUsuario: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.balanceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  textoAvatar: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  nome: { fontSize: 15, fontWeight: '700', fontStyle: 'italic', color: colors.textPrimary },
  email: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  rotuloItem: { flex: 1, marginLeft: 12, fontSize: 13, color: colors.textPrimary },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.expenseBg,
    borderWidth: 1,
    borderColor: colors.expense,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  textoSair: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: colors.expense },
});