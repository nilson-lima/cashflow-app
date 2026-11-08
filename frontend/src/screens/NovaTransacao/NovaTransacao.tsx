import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { TipoTransacao } from '../../models/Transacao';
import { colors } from '../../theme/colors';
import { useTransacoes } from '../../contexts/TransacoesContext';
import { formatarMoeda, dataHojeISO, isoParaBR, brParaISO } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'NovaTransacao'>;

function aplicarMascaraData(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export default function NovaTransacaoScreen({ navigation }: Props) {
  // "categorias" vem da API e já não inclui a Renda
  const { adicionarTransacao, categorias } = useTransacoes();

  const [tipo, setTipo] = useState<TipoTransacao>('despesa');
  const [valorCentavos, setValorCentavos] = useState(0);
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [listaAberta, setListaAberta] = useState(false);
  const [data, setData] = useState(isoParaBR(dataHojeISO()));
  // true enquanto a API está salvando (evita toques repetidos)
  const [enviando, setEnviando] = useState(false);

  const corValor = tipo === 'despesa' ? colors.expense : colors.income;
  const nomeCategoria = categorias.find((c) => c.id === categoriaId)?.nome ?? '';

  function trocarTipo(novo: TipoTransacao) {
    if (novo === tipo) return;
    setTipo(novo);
    setCategoriaId(null); // receita não tem categoria; despesa começa sem escolha
    setListaAberta(false);
  }

  function handleValor(texto: string) {
    const digitos = texto.replace(/\D/g, '').slice(0, 10);
    setValorCentavos(digitos ? parseInt(digitos, 10) : 0);
  }

  async function handleSalvar() {
    if (valorCentavos <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    if (!descricao.trim()) {
      Alert.alert('Descrição obrigatória', 'Informe uma descrição.');
      return;
    }
    const dataISO = brParaISO(data);
    if (!dataISO) {
      Alert.alert('Data inválida', 'Use o formato dd/mm/aaaa.');
      return;
    }

    setEnviando(true);
    const resultado = await adicionarTransacao({
      tipo,
      valorCentavos,
      descricao: descricao.trim(),
      categoriaId: tipo === 'despesa' ? categoriaId : null,
      data: dataISO,
    });
    setEnviando(false);

    if (!resultado.ok) {
      Alert.alert('Não foi possível salvar', resultado.erro);
      return;
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} disabled={enviando}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Nova Transação</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.opcaoTipo, tipo === 'despesa' && { backgroundColor: colors.expenseBg }]}
            onPress={() => trocarTipo('despesa')}
          >
            <Text style={[styles.textoTipo, tipo === 'despesa' && { color: colors.expense }]}>
              Despesa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.opcaoTipo, tipo === 'receita' && { backgroundColor: colors.incomeBg }]}
            onPress={() => trocarTipo('receita')}
          >
            <Text style={[styles.textoTipo, tipo === 'receita' && { color: colors.income }]}>
              Receita
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>VALOR</Text>
        <TextInput
          style={[styles.valor, { color: corValor }]}
          value={formatarMoeda(valorCentavos)}
          onChangeText={handleValor}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Supermercado, Aluguel"
          placeholderTextColor={colors.placeholder}
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* Categoria só existe para despesa (a API não aceita categoria em receita) */}
        {tipo === 'despesa' && (
          <>
            <Text style={styles.label}>Categoria</Text>
            <TouchableOpacity style={styles.select} onPress={() => setListaAberta(!listaAberta)}>
              <Text style={categoriaId !== null ? styles.selectTexto : styles.selectPlaceholder}>
                {nomeCategoria || 'Sem categoria (opcional)'}
              </Text>
              <Ionicons
                name={listaAberta ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {listaAberta && (
              <View style={styles.listaCategorias}>
                <TouchableOpacity
                  style={styles.itemCategoria}
                  onPress={() => {
                    setCategoriaId(null);
                    setListaAberta(false);
                  }}
                >
                  <Text style={styles.selectPlaceholder}>Sem categoria</Text>
                </TouchableOpacity>
                {categorias.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.itemCategoria}
                    onPress={() => {
                      setCategoriaId(c.id);
                      setListaAberta(false);
                    }}
                  >
                    <Text style={styles.selectTexto}>{c.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="dd/mm/aaaa"
          placeholderTextColor={colors.placeholder}
          value={data}
          onChangeText={(t) => setData(aplicarMascaraData(t))}
          keyboardType="numeric"
          maxLength={10}
        />
      </ScrollView>

      <View style={styles.rodape}>
        <TouchableOpacity
          style={[styles.botao, enviando && styles.botaoDesabilitado]}
          onPress={handleSalvar}
          disabled={enviando}
        >
          <Text style={styles.textoBotao}>{enviando ? 'Salvando...' : 'Salvar Transação'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 12,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginLeft: 12 },
  conteudo: { paddingHorizontal: 24, paddingBottom: 24 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 3,
    marginTop: 8,
    marginBottom: 20,
  },
  opcaoTipo: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  textoTipo: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, marginTop: 8 },
  valor: { fontSize: 32, fontWeight: '700', paddingVertical: 4, marginBottom: 8 },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  selectTexto: { fontSize: 14, color: colors.textPrimary },
  selectPlaceholder: { fontSize: 14, color: colors.placeholder },
  listaCategorias: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: colors.background,
  },
  itemCategoria: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rodape: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  botao: {
    backgroundColor: colors.link,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  botaoDesabilitado: { opacity: 0.6 },
  textoBotao: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});