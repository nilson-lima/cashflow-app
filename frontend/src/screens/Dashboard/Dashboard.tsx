import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';
import { useTransacoes } from '../../contexts/TransacoesContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatarMoeda, rotuloData } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { transacoes } = useTransacoes();
  const { usuario } = useAuth();

  const receitas = transacoes
    .filter((t) => t.tipo === 'receita')
    .reduce((soma, t) => soma + t.valorCentavos, 0);
  const despesas = transacoes
    .filter((t) => t.tipo === 'despesa')
    .reduce((soma, t) => soma + t.valorCentavos, 0);
  const saldo = receitas - despesas;

  const recentes = transacoes.slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.saudacao}>Olá, {usuario?.nome.split(' ')[0] ?? 'Usuário'}</Text>
        <Text style={styles.subtitulo}>Seu resumo financeiro</Text>

        <View style={styles.cardSaldo}>
          <Text style={styles.labelSaldo}>Saldo total:</Text>
          <Text style={styles.valorSaldo}>{formatarMoeda(saldo)}</Text>
        </View>

        <View style={styles.linhaResumo}>
          <View
            style={[
              styles.cardResumo,
              { backgroundColor: colors.incomeBg, borderColor: colors.income },
            ]}
          >
            <Text style={[styles.labelResumo, { color: colors.income }]}>Receitas</Text>
            <Text style={[styles.valorResumo, { color: colors.income }]}>
              {formatarMoeda(receitas)}
            </Text>
          </View>
          <View
            style={[
              styles.cardResumo,
              { backgroundColor: colors.expenseBg, borderColor: colors.expense },
            ]}
          >
            <Text style={[styles.labelResumo, { color: colors.expense }]}>Despesas</Text>
            <Text style={[styles.valorResumo, { color: colors.expense }]}>
              {formatarMoeda(despesas)}
            </Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>Movimentações Recentes</Text>

        {recentes.length === 0 && (
          <Text style={styles.vazio}>Nenhuma movimentação ainda. Toque em "+" para adicionar.</Text>
        )}

        {recentes.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.itemTransacao}
            onPress={() => navigation.navigate('Detalhes', { id: t.id })}
          >
            <View style={styles.iconeTransacao}>
              <Ionicons
                name={t.tipo === 'despesa' ? 'cart-outline' : 'cash-outline'}
                size={18}
                color={colors.textSecondary}
              />
            </View>
            <View style={styles.infoTransacao}>
              <Text style={styles.nomeTransacao}>{t.descricao}</Text>
              <Text style={styles.detalheTransacao}>
                {rotuloData(t.data)} • {t.categoria}
              </Text>
            </View>
            <Text style={t.tipo === 'despesa' ? styles.valorNegativo : styles.valorPositivo}>
              {t.tipo === 'despesa' ? '- ' : '+ '}
              {formatarMoeda(t.valorCentavos)}
            </Text>
          </TouchableOpacity>
        ))}
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
  vazio: { fontSize: 13, color: colors.textSecondary, paddingVertical: 12 },
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