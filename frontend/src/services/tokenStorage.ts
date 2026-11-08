import * as SecureStore from 'expo-secure-store';

// Nome sob o qual o token fica guardado no armazenamento seguro do celular.
const CHAVE_TOKEN = 'cashflow_token';

// Guarda o token (criptografado pelo sistema do celular).
export async function salvarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

// Lê o token. Se não existir ou der erro, devolve null
// (o app trata como "ninguém logado").
export async function lerToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

// Apaga o token (usado no logout e quando o token é recusado).
export async function apagarToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CHAVE_TOKEN);
  } catch {
    // Se já não existia, não há o que fazer.
  }
}