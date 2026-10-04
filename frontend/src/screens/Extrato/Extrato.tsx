import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Transacao } from '../../models/Transacao';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';
import FiltrosModal, { FILTROS_VAZIOS, FiltrosTransacao } from '../Filtros/Filtros';
import { useTransacoes } from '../../contexts/TransacoesContext';
import { formatarMoeda, rotuloData } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Extrato'>;

type Aba = 'Tudo' | 'Entradas' | 'Saídas';
const ABAS: Aba[] = ['Tudo', 'Entradas', 'Saídas'];

type Grupo = { data: string; itens: Transacao[] };

export default function ExtratoScreen({ navigation }: Props) {
  const { transacoes } = useTransacoes();
  const [aba, setAba] = useState<Aba>('Tudo');
  const [filtros, setFiltros] = useState<FiltrosTransacao>(FILTROS_VAZIOS);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const filtrosAtivos =
    filtros.dataInicial !== '' || filtros.dataFinal !== '' || filtros.categoria !== 'Todas';

  const filtradas = transacoes.filter((t) => {
    if (aba === 'Entradas' && t.tipo !== 'receita') return false;
    if (aba === 'Saídas' && t.tipo !== 'despesa') return false;
    if (filtros.dataInicial && t.data < filtros.dataInicial) return false;
    if (filtros.dataFinal && t.data > filtros.dataFinal) return false;
    if (filtros.categoria !== 'Todas' && t.categoria !== filtros.categoria) return false;
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

  function abrirDetalhes(t: Transacao) {
    navigation.navigate('Detalhes', { id: t.id });
  }

  function aplicarFiltros(novos: FiltrosTransacao) {
    setFiltros(novos);
    setFiltrosAbertos(false);
  }

  function mensagemVazia() {
    if (transacoes.length === 0) return 'Nenhuma transação ainda. Toque em "+" para adicionar.';
    if (filtrosAtivos) return 'Nenhuma transação encontrada com esses filtros.';
    return 'Nenhuma transação nesta categoria.';
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Extrato</Text>
          <TouchableOpacity style={styles.botaoFiltro} onPress={() => setFiltrosAbertos(true)}>
            <Ionicons name="filter" size={16} color="#FFFFFF" />
            {filtrosAtivos && <View style={styles.indicadorFiltro} />}
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

        {grupos.length === 0 && <Text style={styles.vazio}>{mensagemVazia()}</Text>}

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

      <FiltrosModal
        visible={filtrosAbertos}
        filtrosAtuais={filtros}
        onAplicar={aplicarFiltros}
        onFechar={() => setFiltrosAbertos(false)}
      />
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
  indicadorFiltro: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.expense,
    borderWidth: 1.5,
    borderColor: colors.background,
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