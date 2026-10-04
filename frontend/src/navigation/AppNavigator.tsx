import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login/Login';
import CadastroScreen from '../screens/Cadastro/Cadastro';
import DashboardScreen from '../screens/Dashboard/Dashboard';
import GraficosScreen from '../screens/Graficos/Graficos';
import NovaTransacaoScreen from '../screens/NovaTransacao/NovaTransacao';
import ExtratoScreen from '../screens/Extrato/Extrato';
import DetalhesScreen from '../screens/Detalhes/Detalhes';
import EditarTransacaoScreen from '../screens/EditarTransacao/EditarTransacao';
import PerfilScreen from '../screens/Perfil/Perfil';
import { useAuth } from '../contexts/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Dashboard: undefined;
  Graficos: undefined;
  NovaTransacao: undefined;
  Extrato: undefined;
  Detalhes: { id: string };
  EditarTransacao: { id: string };
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { usuario, carregando } = useAuth();

  // Espera recuperar a sessão para decidir a tela inicial
  if (carregando) return null;

  return (
    <Stack.Navigator
      initialRouteName={usuario ? 'Dashboard' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Graficos" component={GraficosScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Extrato" component={ExtratoScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Perfil" component={PerfilScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Detalhes" component={DetalhesScreen} />
      <Stack.Screen name="EditarTransacao" component={EditarTransacaoScreen} />
      <Stack.Screen
        name="NovaTransacao"
        component={NovaTransacaoScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}