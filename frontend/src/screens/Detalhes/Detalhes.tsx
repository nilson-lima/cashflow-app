import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/colors';
import BottomBar from '../../components/BottomBar';
import { useTransacoes } from '../../contexts/TransacoesContext';
import { formatarMoeda, isoParaBR } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Detalhes'>;

export default function DetalhesScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { transacoes, excluirTransacao } = useTransacoes();
  const [modalAberto, setModalAberto] = useState(false);

  const transacao = transacoes.find((t) => t.id === id);

  // Depois de excluir, a transação deixa de existir e a tela só fecha
  if (!transacao) return null;

  const ehDespesa = transacao.tipo === 'despesa';
  const corValor = ehDespesa ? colors.expense : colors.income;

  // TODO: abrir a tela de Editar quando ela existir
  function handleEditar() {
    Alert.alert('Em breve', 'A tela de edição ainda não foi implementada.');
  }

  function handleConfirmarExclusao() {
    excluirTransacao(transacao!.id);
    setModalAberto(false);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Detalhes da Transação</Text>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.cardValor}>
          <View style={styles.icone}>
            <Ionicons
              name={ehDespesa ? 'cart-outline' : 'cash-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </View>
          <Text style={[styles.valor, { color: corValor }]}>
            {ehDespesa ? '- ' : '+ '}
            {formatarMoeda(transacao.valorCentavos)}
          </Text>
          <Text style={styles.descricaoCard}>{transacao.descricao}</Text>
        </View>

        <View style={styles.tabela}>
          <Linha rotulo="Tipo" valor={ehDespesa ? 'Despesa' : 'Receita'} cor={corValor} />
          <Linha rotulo="Categoria" valor={transacao.categoria} />
          <Linha rotulo="Data" valor={isoParaBR(transacao.data)} />
          <Linha rotulo="Descrição" valor={transacao.descricao} ultima />
        </View>

        <TouchableOpacity style={styles.botaoEditar} onPress={handleEditar}>
          <Text style={styles.textoEditar}>Editar Transação</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoExcluir} onPress={() => setModalAberto(true)}>
          <Text style={styles.textoExcluir}>Excluir Transação</Text>
        </TouchableOpacity>
      </View>

      <BottomBar ativo="Extrato" />

      <Modal
        visible={modalAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.iconeModal}>
              <Ionicons name="trash-outline" size={20} color={colors.expense} />
            </View>
            <Text style={styles.tituloModal}>Excluir Transação?</Text>
            <Text style={styles.textoModal}>
              "{transacao.descricao}" ({formatarMoeda(transacao.valorCentavos)}) será removida do
              extrato e deixará de contar no saldo. Esta ação não pode ser desfeita.
            </Text>

            <TouchableOpacity style={styles.botaoConfirmar} onPress={handleConfirmarExclusao}>
              <Text style={styles.textoConfirmar}>Excluir Transação</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalAberto(false)}>
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Linha({
  rotulo,
  valor,
  cor,
  ultima,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
  ultima?: boolean;
}) {
  return (
    <View style={[styles.linha, ultima && { borderBottomWidth: 0 }]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valorLinha, cor ? { color: cor } : null]}>{valor}</Text>
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
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  conteudo: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  cardValor: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 16,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  valor: { fontSize: 24, fontWeight: '700' },
  descricaoCard: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  tabela: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rotulo: { fontSize: 12, color: colors.textSecondary },
  valorLinha: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  botaoEditar: {
    backgroundColor: colors.balanceCard,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoEditar: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  botaoExcluir: {
    backgroundColor: colors.expenseBg,
    borderWidth: 1,
    borderColor: colors.expense,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  textoExcluir: { color: colors.expense, fontSize: 14, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  iconeModal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.expenseBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tituloModal: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  textoModal: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  botaoConfirmar: {
    width: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  textoConfirmar: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  botaoCancelar: {
    width: '100%',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  textoCancelar: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
});