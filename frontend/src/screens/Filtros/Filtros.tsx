import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { isoParaBR, brParaISO } from '../../utils/formatters';

// Datas em formato AAAA-MM-DD ('' = sem limite)
export type FiltrosTransacao = {
  dataInicial: string;
  dataFinal: string;
  categoria: string;
};

export const FILTROS_VAZIOS: FiltrosTransacao = {
  dataInicial: '',
  dataFinal: '',
  categoria: 'Todas',
};

const CATEGORIAS = ['Todas', 'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Salário', 'Outros'];

function aplicarMascaraData(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

type Props = {
  visible: boolean;
  filtrosAtuais: FiltrosTransacao;
  onAplicar: (filtros: FiltrosTransacao) => void;
  onFechar: () => void;
};

export default function FiltrosModal({ visible, filtrosAtuais, onAplicar, onFechar }: Props) {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  // Ao abrir, os campos mostram os filtros que estão valendo
  useEffect(() => {
    if (visible) {
      setDataInicial(filtrosAtuais.dataInicial ? isoParaBR(filtrosAtuais.dataInicial) : '');
      setDataFinal(filtrosAtuais.dataFinal ? isoParaBR(filtrosAtuais.dataFinal) : '');
      setCategoria(filtrosAtuais.categoria);
    }
  }, [visible, filtrosAtuais]);

  function handleAplicar() {
    let inicialISO = '';
    let finalISO = '';

    if (dataInicial) {
      const iso = brParaISO(dataInicial);
      if (!iso) {
        Alert.alert('Data inicial inválida', 'Use o formato dd/mm/aaaa.');
        return;
      }
      inicialISO = iso;
    }
    if (dataFinal) {
      const iso = brParaISO(dataFinal);
      if (!iso) {
        Alert.alert('Data final inválida', 'Use o formato dd/mm/aaaa.');
        return;
      }
      finalISO = iso;
    }
    if (inicialISO && finalISO && inicialISO > finalISO) {
      Alert.alert('Período inválido', 'A data inicial não pode ser depois da data final.');
      return;
    }

    onAplicar({ dataInicial: inicialISO, dataFinal: finalISO, categoria });
  }

  function handleLimpar() {
    setDataInicial('');
    setDataFinal('');
    setCategoria('Todas');
    onAplicar(FILTROS_VAZIOS);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.fundo} activeOpacity={1} onPress={onFechar} />

        <View style={styles.painel}>
          <View style={styles.puxador} />

          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Filtros</Text>
            <TouchableOpacity onPress={onFechar} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.secao}>PERÍODO</Text>
            <View style={styles.linhaDatas}>
              <View style={styles.campoData}>
                <Text style={styles.label}>Data inicial</Text>
                <TextInput
                  style={styles.input}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor={colors.placeholder}
                  value={dataInicial}
                  onChangeText={(t) => setDataInicial(aplicarMascaraData(t))}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={styles.campoData}>
                <Text style={styles.label}>Data final</Text>
                <TextInput
                  style={styles.input}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor={colors.placeholder}
                  value={dataFinal}
                  onChangeText={(t) => setDataFinal(aplicarMascaraData(t))}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            <Text style={styles.secao}>CATEGORIA</Text>
            <View style={styles.chips}>
              {CATEGORIAS.map((c) => {
                const selecionada = c === categoria;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, selecionada && styles.chipSelecionado]}
                    onPress={() => setCategoria(c)}
                  >
                    <Text style={[styles.textoChip, selecionada && styles.textoChipSelecionado]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.botaoAplicar} onPress={handleAplicar}>
            <Text style={styles.textoAplicar}>Aplicar filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoLimpar} onPress={handleLimpar}>
            <Text style={styles.textoLimpar}>Limpar filtros</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  fundo: { flex: 1 },
  painel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  puxador: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  secao: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  linhaDatas: { flexDirection: 'row', gap: 12 },
  campoData: { flex: 1 },
  label: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  chipSelecionado: { backgroundColor: colors.balanceCard },
  textoChip: { fontSize: 12, color: colors.textPrimary },
  textoChipSelecionado: { color: '#FFFFFF', fontWeight: '600' },
  botaoAplicar: {
    backgroundColor: colors.balanceCard,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  textoAplicar: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  botaoLimpar: { padding: 12, alignItems: 'center' },
  textoLimpar: { color: colors.textSecondary, fontSize: 13 },
});