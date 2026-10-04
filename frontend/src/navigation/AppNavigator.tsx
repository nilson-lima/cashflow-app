import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login/Login';
import CadastroScreen from '../screens/Cadastro/Cadastro';
import DashboardScreen from '../screens/Dashboard/Dashboard';
import GraficosScreen from '../screens/Graficos/Graficos';
import NovaTransacaoScreen from '../screens/NovaTransacao/NovaTransacao';
import ExtratoScreen from '../screens/Extrato/Extrato';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Dashboard: undefined;
  Graficos: undefined;
  NovaTransacao: undefined;
  Extrato: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Graficos" component={GraficosScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Extrato" component={ExtratoScreen} options={{ animation: 'none' }} />
      <Stack.Screen
        name="NovaTransacao"
        component={NovaTransacaoScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}