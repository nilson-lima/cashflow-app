import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Graficos'>;

type Periodo = 'Semana' | 'Mês' | 'Ano';

type CategoriaGasto = { nome: string; valor: number; cor: string };

// TODO: trocar por dados calculados a partir das transações cadastradas
const DADOS: Record<Periodo, CategoriaGasto[]> = {
  Semana: [
    { nome: 'Alimentação', valor: 542.5, cor: '#8B7FE8' },
    { nome: 'Moradia', valor: 465, cor: '#F29E7D' },
    { nome: 'Transporte', valor: 310, cor: '#4FCB9E' },
    { nome: 'Lazer', valor: 232.5, cor: '#F08CB0' },
  ],
  Mês: [
    { nome: 'Alimentação', valor: 1200, cor: '#8B7FE8' },
    { nome: 'Moradia', valor: 1500, cor: '#F29E7D' },
    { nome: 'Transporte', valor: 600, cor: '#4FCB9E' },
    { nome: 'Lazer', valor: 400, cor: '#F08CB0' },
  ],
  Ano: [
    { nome: 'Alimentação', valor: 14000, cor: '#8B7FE8' },
    { nome: 'Moradia', valor: 18000, cor: '#F29E7D' },
    { nome: 'Transporte', valor: 7200, cor: '#4FCB9E' },
    { nome: 'Lazer', valor: 4800, cor: '#F08CB0' },
  ],
};

const PERIODOS: Periodo[] = ['Semana', 'Mês', 'Ano'];

function formatarMoeda(valor: number) {
  const [inteiro, decimal] = valor.toFixed(2).split('.');
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${comMilhar},${decimal}`;
}

const TAMANHO = 200;
const ESPESSURA = 36;
const RAIO = (TAMANHO - ESPESSURA) / 2;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export default function GraficosScreen({ navigation }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('Semana');

  const categorias = DADOS[periodo];
  const total = categorias.reduce((soma, c) => soma + c.valor, 0);

  let acumulado = 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.titulo}>Gráficos</Text>
        <Text style={styles.subtitulo}>Análise dos seus gastos</Text>

        <View style={styles.seletor}>
          {PERIODOS.map((p) => {
            const selecionado = p === periodo;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                onPress={() => setPeriodo(p)}
              >
                <Text style={[styles.textoOpcao, selecionado && styles.textoOpcaoSelecionado]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.cardTotal}>
          <Text style={styles.labelTotal}>Total gasto no período</Text>
          <Text style={styles.valorTotal}>{formatarMoeda(total)}</Text>
        </View>

        <View style={styles.areaGrafico}>
          <Svg width={TAMANHO} height={TAMANHO}>
            <G rotation="-90" origin={`${TAMANHO / 2}, ${TAMANHO / 2}`}>
              {categorias.map((c) => {
                const tamanho = (c.valor / total) * CIRCUNFERENCIA;
                const deslocamento = -acumulado;
                acumulado += tamanho;
                return (
                  <Circle
                    key={c.nome}
                    cx={TAMANHO / 2}
                    cy={TAMANHO / 2}
                    r={RAIO}
                    stroke={c.cor}
                    strokeWidth={ESPESSURA}
                    fill="none"
                    strokeDasharray={`${tamanho} ${CIRCUNFERENCIA - tamanho}`}
                    strokeDashoffset={deslocamento}
                  />
                );
              })}
            </G>
          </Svg>
          <View style={styles.centroGrafico}>
            <Text style={styles.valorCentro}>{formatarMoeda(total)}</Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>Por categoria</Text>

        {categorias.map((c) => (
          <View key={c.nome} style={styles.linhaCategoria}>
            <View style={[styles.marcador, { backgroundColor: c.cor }]} />
            <View style={styles.infoCategoria}>
              <Text style={styles.nomeCategoria}>{c.nome}</Text>
              <Text style={styles.percentual}>{Math.round((c.valor / total) * 100)}%</Text>
            </View>
            <Text style={styles.valorCategoria}>{formatarMoeda(c.valor)}</Text>
          </View>
        ))}
      </ScrollView>

      <BottomBar ativo="Graficos" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 48, paddingBottom: 24 },
  titulo: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subtitulo: { fontSize: 12, color: colors.textSecondary, marginBottom: 16 },
  seletor: {
    flexDirection: 'row',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  opcao: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  opcaoSelecionada: { backgroundColor: colors.primary },
  textoOpcao: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  textoOpcaoSelecionado: { color: '#FFFFFF' },
  cardTotal: {
    backgroundColor: colors.balanceCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  labelTotal: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  valorTotal: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  areaGrafico: {
    alignSelf: 'center',
    width: TAMANHO,
    height: TAMANHO,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centroGrafico: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorCentro: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  tituloSecao: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  linhaCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  marcador: { width: 12, height: 12, borderRadius: 3, marginRight: 12 },
  infoCategoria: { flex: 1 },
  nomeCategoria: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  percentual: { fontSize: 11, color: colors.placeholder },
  valorCategoria: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
});