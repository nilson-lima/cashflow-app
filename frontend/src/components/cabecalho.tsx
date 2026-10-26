import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  titulo: string;
  subtitulo?: string;
};

export default function Cabecalho({ titulo, subtitulo }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#1F3864" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#1B1B1B' },
  subtitulo: { fontSize: 12, color: '#6B6B6B', marginTop: 4, marginLeft: 32 },
});