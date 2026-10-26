import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../../components/cabecalho';

const OPCOES = [
  { chave: 'lembretes', titulo: 'Lembretes de contas', descricao: 'Aviso perto do vencimento' },
  { chave: 'alertas', titulo: 'Alertas de gastos', descricao: 'Quando as despesas passarem das receitas' },
  { chave: 'resumo', titulo: 'Resumo semanal', descricao: 'Um resumo das suas finanças toda semana' },
] as const;

type Chave = (typeof OPCOES)[number]['chave'];

export default function NotificacoesScreen() {
  const [ativas, setAtivas] = useState<Record<Chave, boolean>>({
    lembretes: true,
    alertas: true,
    resumo: false,
  });

  function alternar(chave: Chave) {
    setAtivas((atual) => ({ ...atual, [chave]: !atual[chave] }));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        <Cabecalho titulo="Notificações" subtitulo="Escolha o que você quer receber" />

        <View style={styles.lista}>
          {OPCOES.map((opcao) => (
            <View key={opcao.chave} style={styles.linha}>
              <View style={styles.textos}>
                <Text style={styles.titulo}>{opcao.titulo}</Text>
                <Text style={styles.descricao}>{opcao.descricao}</Text>
              </View>
              <Switch
                value={ativas[opcao.chave]}
                onValueChange={() => alternar(opcao.chave)}
                trackColor={{ false: '#D5D5D5', true: '#1D4ED8' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  conteudo: { flex: 1, padding: 24 },
  lista: { borderTopWidth: 0.5, borderTopColor: '#F0F0F0' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  textos: { flex: 1, paddingRight: 12 },
  titulo: { fontSize: 14, color: '#1B1B1B', marginBottom: 2 },
  descricao: { fontSize: 12, color: '#9B9B9B' },
});