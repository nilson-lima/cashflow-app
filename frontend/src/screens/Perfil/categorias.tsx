import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cabecalho from '../../components/cabecalho';

const CATEGORIAS = [
  { nome: 'Alimentação', cor: '#7F77DD' },
  { nome: 'Moradia', cor: '#F0997B' },
  { nome: 'Transporte', cor: '#5DCAA5' },
  { nome: 'Lazer', cor: '#ED93B1' },
  { nome: 'Saúde', cor: '#378ADD' },
  { nome: 'Renda', cor: '#1D9E75' },
];

export default function CategoriasScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        <Cabecalho titulo="Categorias" subtitulo="Usadas para classificar suas despesas" />

        <View style={styles.lista}>
          {CATEGORIAS.map((categoria) => (
            <View key={categoria.nome} style={styles.linha}>
              <View style={[styles.cor, { backgroundColor: categoria.cor }]} />
              <Text style={styles.nome}>{categoria.nome}</Text>
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
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  cor: { width: 14, height: 14, borderRadius: 4, marginRight: 12 },
  nome: { fontSize: 14, color: '#1B1B1B' },
});