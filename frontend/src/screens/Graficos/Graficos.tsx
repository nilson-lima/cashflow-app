import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';
import { api, ApiError } from '../../services/api';
import { formatarMoeda, isoParaBR, valorApiParaCentavos } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Graficos'>;

type Periodo = 'Semana' | 'Mês' | 'Ano';
const PERIODOS: Periodo[] = ['Semana', 'Mês', 'Ano'];

// Nome do período como a API espera no parâmetro "periodo"
const PARAMETRO_API: Record<Periodo, string> = {
  Semana: 'semana',
  'Mês': 'mes',
  Ano: 'ano',
};

// Resposta do GET /graficos/categorias (valores em texto, ex.: "50.00").
type GraficoApi = {
  periodo: string | null;
  data_inicial: string | null;
  data_final: string | null;
  total_despesas: string;
  categorias: { categoria: string; total: string; percentual: string }[];
};

type CategoriaGasto = { nome: string; valor: number; percentual: number; cor: string };

const CORES: Record<string, string> = {
  Alimentação: '#8B7FE8',
  Moradia: '#F29E7D',
  Transporte: '#4FCB9E',
  Lazer: '#F08CB0',
  Saúde: '#E5B84B',
  'Sem categoria': '#9B9B9B',
};
const COR_PADRAO = '#9B9B9B';

const TAMANHO = 200;
const ESPESSURA = 36;
const RAIO = (TAMANHO - ESPESSURA) / 2;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export default function GraficosScreen({ navigation }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('Semana');
  const [dados, setDados] = useState<GraficoApi | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Número da busca mais recente: descarta respostas antigas (ex.: período trocado rápido).
  const versaoRef = useRef(0);

  const carregar = useCallback(async () => {
    const minhaVersao = ++versaoRef.current;
    setCarregando(true);
    setErro(null);
    try {
      const r = await api.get<GraficoApi>('/graficos/categorias', {
        params: { periodo: PARAMETRO_API[periodo] },
      });
      if (minhaVersao !== versaoRef.current) return;
      setDados(r);
    } catch (e) {
      if (minhaVersao !== versaoRef.current) return;
      setDados(null);
      setErro(e instanceof ApiError ? e.message : 'Ocorreu um erro inesperado.');
    } finally {
      if (minhaVersao === versaoRef.current) setCarregando(false);
    }
  }, [periodo]);

  // Busca ao abrir a tela, ao voltar para ela e quando o período muda.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function trocarPeriodo(novo: Periodo) {
    if (novo === periodo) return;
    setDados(null); // não mostra os números do período anterior
    setPeriodo(novo);
  }

  const total = dados ? valorApiParaCentavos(dados.total_despesas) : 0;

  // Categorias da API convertidas para o formato da tela, maiores primeiro
  const categorias: CategoriaGasto[] = (dados?.categorias ?? [])
    .map((c) => ({
      nome: c.categoria,
      valor: valorApiParaCentavos(c.total),
      percentual: Number(c.percentual),
      cor: CORES[c.categoria] ?? COR_PADRAO,
    }))
    .sort((a, b) => b.valor - a.valor);

  // Calcula onde cada fatia começa no círculo, usando o percentual que a API já calculou
  let acumulado = 0;
  const fatias = categorias.map((c) => {
    const tamanho = (c.percentual / 100) * CIRCUNFERENCIA;
    const fatia = { ...c, tamanho, deslocamento: -acumulado };
    acumulado += tamanho;
    return fatia;
  });

  function mensagemVazia() {
    if (carregando) return 'Carregando...';
    if (erro) return `${erro} Puxe a tela para baixo para tentar de novo.`;
    return 'Nenhuma despesa neste período.';
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} />}
      >
        <Text style={styles.titulo}>Gráficos</Text>
        <Text style={styles.subtitulo}>Análise dos seus gastos</Text>

        <View style={styles.seletor}>
          {PERIODOS.map((p) => {
            const selecionado = p === periodo;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                onPress={() => trocarPeriodo(p)}
              >
                <Text style={[styles.textoOpcao, selecionado && styles.textoOpcaoSelecionado]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {dados?.data_inicial && dados?.data_final && (
          <Text style={styles.faixaPeriodo}>
            Período: {isoParaBR(dados.data_inicial)} a {isoParaBR(dados.data_final)}
          </Text>
        )}

        <View style={styles.cardTotal}>
          <Text style={styles.labelTotal}>Total gasto no período</Text>
          <Text style={styles.valorTotal}>{dados ? formatarMoeda(total) : 'R$ --'}</Text>
        </View>

        {categorias.length === 0 ? (
          <Text style={styles.vazio}>{mensagemVazia()}</Text>
        ) : (
          <>
            <View style={styles.areaGrafico}>
              <Svg width={TAMANHO} height={TAMANHO}>
                <G rotation="-90" origin={`${TAMANHO / 2}, ${TAMANHO / 2}`}>
                  {fatias.map((f) => (
                    <Circle
                      key={f.nome}
                      cx={TAMANHO / 2}
                      cy={TAMANHO / 2}
                      r={RAIO}
                      stroke={f.cor}
                      strokeWidth={ESPESSURA}
                      fill="none"
                      strokeDasharray={`${f.tamanho} ${CIRCUNFERENCIA - f.tamanho}`}
                      strokeDashoffset={f.deslocamento}
                    />
                  ))}
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
                  <Text style={styles.percentual}>
                    {c.percentual.toFixed(1).replace('.', ',')}%
                  </Text>
                </View>
                <Text style={styles.valorCategoria}>{formatarMoeda(c.valor)}</Text>
              </View>
            ))}
          </>
        )}
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
  faixaPeriodo: { fontSize: 11, color: colors.placeholder, marginBottom: 8 },
  cardTotal: {
    backgroundColor: colors.balanceCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  labelTotal: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  valorTotal: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  vazio: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingVertical: 24 },
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