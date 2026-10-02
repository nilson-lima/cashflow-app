import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { TransacoesProvider } from './src/contexts/TransacoesContext';

export default function App() {
  return (
    <TransacoesProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </TransacoesProvider>
  );
}