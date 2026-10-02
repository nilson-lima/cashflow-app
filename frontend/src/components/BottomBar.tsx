import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Aba = 'Inicio' | 'Graficos' | 'Extrato' | 'Perfil';

type Props = {
  ativo: Aba;
};

export default function BottomBar({ ativo }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  function telaEmBreve() {
    Alert.alert('Em breve', 'Essa tela ainda não foi implementada.');
  }

  function irPara(aba: Aba) {
    if (aba === ativo) return;

    if (aba === 'Inicio') {
      navigation.replace('Dashboard');
    } else if (aba === 'Graficos') {
      navigation.replace('Graficos');
    } else {
      // TODO: ligar Extrato e Perfil quando as telas existirem
      telaEmBreve();
    }
  }

  function Item({ aba, icone, label }: { aba: Aba; icone: any; label: string }) {
    const ehAtivo = ativo === aba;
    return (
      <TouchableOpacity style={styles.item} onPress={() => irPara(aba)}>
        {ehAtivo && <View style={styles.indicador} />}
        <Ionicons name={icone} size={22} color={ehAtivo ? colors.primary : colors.inactive} />
        <Text style={[styles.label, ehAtivo && styles.labelAtivo]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.bar}>
      <Item aba="Inicio" icone="home" label="Início" />
      <Item aba="Graficos" icone="stats-chart" label="Gráficos" />

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('NovaTransacao')}>
        <View style={styles.fab}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </View>
        <Text style={styles.label}>Nova</Text>
      </TouchableOpacity>

      <Item aba="Extrato" icone="document-text" label="Extrato" />
      <Item aba="Perfil" icone="person" label="Perfil" />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  item: { flex: 1, alignItems: 'center' },
  indicador: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 2,
    backgroundColor: colors.primary,
  },
  label: { fontSize: 11, color: colors.inactive, marginTop: 2 },
  labelAtivo: { color: colors.primary, fontWeight: '600' },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.link,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
});