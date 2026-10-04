import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Transacao } from '../../models/Transacao';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';
import { useTransacoes } from '../../contexts/TransacoesContext';
import { formatarMoeda, rotuloData } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Extrato'>;

type Aba = 'Tudo' | 'Entradas' | 'Saídas';
const ABAS: Aba[] = ['Tudo', 'Entradas', 'Saídas'];

type Grupo = { data: string; itens: Transacao[] };

export default function ExtratoScreen({ navigation }: Props) {
  const { transacoes } = useTransacoes();
  const [aba, setAba] = useState<Aba>('Tudo');

  const filtradas = transacoes.filter((t) => {
    if (aba === 'Entradas') return t.tipo === 'receita';
    if (aba === 'Saídas') return t.tipo === 'despesa';
    return true;
  });

  // Agrupa por data (a lista já vem ordenada da mais recente para a mais antiga)
  const grupos: Grupo[] = [];
  filtradas.forEach((t) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.data === t.data) {
      ultimo.itens.push(t);
    } else {
      grupos.push({ data: t.data, itens: [t] });
    }
  });

  // TODO: abrir a tela de Filtros quando ela existir
  function abrirFiltros() {
    Alert.alert('Em breve', 'A tela de filtros ainda não foi implementada.');
  }

  // TODO: abrir Detalhes da Transação quando a tela existir
  function abrirDetalhes(_t: Transacao) {
    Alert.alert('Em breve', 'A tela de detalhes ainda não foi implementada.');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Extrato</Text>
          <TouchableOpacity style={styles.botaoFiltro} onPress={abrirFiltros}>
            <Ionicons name="filter" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.abas}>
          {ABAS.map((a) => {
            const selecionada = a === aba;
            return (
              <TouchableOpacity
                key={a}
                style={[styles.aba, selecionada && styles.abaSelecionada]}
                onPress={() => setAba(a)}
              >
                <Text style={[styles.textoAba, selecionada && styles.textoAbaSelecionada]}>
                  {a}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {grupos.length === 0 && (
          <Text style={styles.vazio}>
            {transacoes.length === 0
              ? 'Nenhuma transação ainda. Toque em "+" para adicionar.'
              : 'Nenhuma transação nesta categoria.'}
          </Text>
        )}

        {grupos.map((g) => (
          <View key={g.data}>
            <Text style={styles.rotuloData}>{rotuloData(g.data)}</Text>
            {g.itens.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.itemTransacao}
                onPress={() => abrirDetalhes(t)}
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
                  <Text style={styles.detalheTransacao}>{t.categoria}</Text>
                </View>
                <Text style={t.tipo === 'despesa' ? styles.valorNegativo : styles.valorPositivo}>
                  {t.tipo === 'despesa' ? '- ' : '+ '}
                  {formatarMoeda(t.valorCentavos)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <BottomBar ativo="Extrato" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 48, paddingBottom: 24 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  botaoFiltro: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abas: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  aba: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  abaSelecionada: { backgroundColor: colors.primary },
  textoAba: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  textoAbaSelecionada: { color: '#FFFFFF' },
  vazio: { fontSize: 13, color: colors.textSecondary, paddingVertical: 12 },
  rotuloData: {
    fontSize: 11,
    color: colors.placeholder,
    marginTop: 8,
    marginBottom: 4,
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