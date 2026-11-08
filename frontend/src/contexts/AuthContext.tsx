import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, ApiError, definirAoNaoAutorizado } from '../services/api';
import { apagarToken, salvarToken } from '../services/tokenStorage';

// Usuário como a API devolve em GET /auth/eu.
export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

// Resultado das ações: ok:true, ou ok:false com a mensagem para mostrar na tela.
type Resultado = { ok: true } | { ok: false; erro: string };

type AuthContextData = {
  usuario: Usuario | null;
  carregando: boolean; // true enquanto o app verifica se já há sessão
  cadastrar: (nome: string, email: string, senha: string) => Promise<Resultado>;
  entrar: (email: string, senha: string) => Promise<Resultado>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function mensagemDoErro(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Ocorreu um erro inesperado.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Se qualquer chamada receber 401, encerra a sessão (volta ao Login).
    definirAoNaoAutorizado(() => {
      apagarToken();
      setUsuario(null);
    });

    // Ao abrir o app: se existe token válido, restaura a sessão.
    async function restaurarSessao() {
      try {
        // A api.get anexa o token sozinha; sem token o /auth/eu devolve 401.
        const eu = await api.get<Usuario>('/auth/eu');
        setUsuario(eu);
      } catch {
        // Sem token, token inválido ou API fora do ar: cai no Login.
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    }
    restaurarSessao();

    return () => definirAoNaoAutorizado(null);
  }, []);

  // Cria a conta. NÃO faz login: a tela volta ao Login depois.
  async function cadastrar(nome: string, email: string, senha: string): Promise<Resultado> {
    try {
      await api.post(
        '/auth/cadastro',
        { nome: nome.trim(), email: email.trim().toLowerCase(), senha },
        { comToken: false }
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: mensagemDoErro(e) };
    }
  }

  // Login: pede o token, guarda com segurança e busca os dados do usuário.
  async function entrar(email: string, senha: string): Promise<Resultado> {
    try {
      const resp = await api.post<{ access_token: string; token_type: string }>(
        '/auth/login',
        { email: email.trim().toLowerCase(), senha },
        { comToken: false }
      );
      await salvarToken(resp.access_token);
      const eu = await api.get<Usuario>('/auth/eu');
      setUsuario(eu);
      return { ok: true };
    } catch (e) {
      await apagarToken();
      return { ok: false, erro: mensagemDoErro(e) };
    }
  }

  // Logout: apaga o token e zera o usuário.
  async function sair(): Promise<void> {
    await apagarToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, cadastrar, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}