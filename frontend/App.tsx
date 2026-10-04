import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { TransacoesProvider } from './src/contexts/TransacoesContext';

export default function App() {
  return (
    <AuthProvider>
      <TransacoesProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </TransacoesProvider>
    </AuthProvider>
  );
}