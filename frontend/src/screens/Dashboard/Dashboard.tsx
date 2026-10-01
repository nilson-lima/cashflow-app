import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.saudacao}>Olá, Usuário</Text>
        <Text style={styles.subtitulo}>Seu resumo financeiro</Text>

        <View style={styles.cardSaldo}>
          <Text style={styles.labelSaldo}>Saldo total:</Text>
          <Text style={styles.valorSaldo}>R$ 2.450,00</Text>
        </View>

        <View style={styles.linhaResumo}>
          <View
            style={[
              styles.cardResumo,
              { backgroundColor: colors.incomeBg, borderColor: colors.income },
            ]}
          >
            <Text style={[styles.labelResumo, { color: colors.income }]}>Receitas</Text>
            <Text style={[styles.valorResumo, { color: colors.income }]}>R$ 4.000,00</Text>
          </View>
          <View
            style={[
              styles.cardResumo,
              { backgroundColor: colors.expenseBg, borderColor: colors.expense },
            ]}
          >
            <Text style={[styles.labelResumo, { color: colors.expense }]}>Despesas</Text>
            <Text style={[styles.valorResumo, { color: colors.expense }]}>R$ 1.550,00</Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>Movimentações Recentes</Text>

        <View style={styles.itemTransacao}>
          <View style={styles.iconeTransacao}>
            <Ionicons name="cart-outline" size={18} color={colors.textSecondary} />
          </View>
          <View style={styles.infoTransacao}>
            <Text style={styles.nomeTransacao}>Supermercado</Text>
            <Text style={styles.detalheTransacao}>Hoje • Alimentação</Text>
          </View>
          <Text style={styles.valorNegativo}>- R$ 250,00</Text>
        </View>

        <View style={styles.itemTransacao}>
          <View style={styles.iconeTransacao}>
            <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
          </View>
          <View style={styles.infoTransacao}>
            <Text style={styles.nomeTransacao}>Salário</Text>
            <Text style={styles.detalheTransacao}>Ontem • Salário</Text>
          </View>
          <Text style={styles.valorPositivo}>+ R$ 4.000,00</Text>
        </View>
      </ScrollView>

      <BottomBar ativo="Inicio" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 48, paddingBottom: 24 },
  saudacao: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subtitulo: { fontSize: 12, color: colors.textSecondary, marginBottom: 16 },
  cardSaldo: {
    backgroundColor: colors.balanceCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  labelSaldo: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  valorSaldo: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  linhaResumo: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  cardResumo: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1 },
  labelResumo: { fontSize: 11, marginBottom: 4 },
  valorResumo: { fontSize: 15, fontWeight: '700' },
  tituloSecao: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  itemTransacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconeTransacao: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTransacao: { flex: 1 },
  nomeTransacao: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  detalheTransacao: { fontSize: 11, color: colors.placeholder },
  valorNegativo: { fontSize: 13, fontWeight: '600', color: colors.expense },
  valorPositivo: { fontSize: 13, fontWeight: '600', color: colors.income },
});