import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_USUARIOS = '@cashflow:usuarios';
const CHAVE_SESSAO = '@cashflow:sessao';

export type Usuario = { nome: string; email: string };
type UsuarioSalvo = Usuario & { senha: string };
type Resultado = { ok: boolean; erro?: string };

type AuthContextData = {
  usuario: Usuario | null;
  carregando: boolean;
  cadastrar: (nome: string, email: string, senha: string) => Promise<Resultado>;
  entrar: (email: string, senha: string) => Promise<Resultado>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

async function lerUsuarios(): Promise<UsuarioSalvo[]> {
  try {
    const json = await AsyncStorage.getItem(CHAVE_USUARIOS);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app, recupera a sessão (se o usuário não tinha saído)
  useEffect(() => {
    async function carregarSessao() {
      try {
        const email = await AsyncStorage.getItem(CHAVE_SESSAO);
        if (email) {
          const usuarios = await lerUsuarios();
          const encontrado = usuarios.find((u) => u.email === email);
          if (encontrado) setUsuario({ nome: encontrado.nome, email: encontrado.email });
        }
      } catch {}
      setCarregando(false);
    }
    carregarSessao();
  }, []);

  async function cadastrar(nome: string, email: string, senha: string): Promise<Resultado> {
    const emailNormalizado = email.trim().toLowerCase();
    const usuarios = await lerUsuarios();

    if (usuarios.some((u) => u.email === emailNormalizado)) {
      return { ok: false, erro: 'Já existe uma conta com esse e-mail.' };
    }

    usuarios.push({ nome: nome.trim(), email: emailNormalizado, senha });
    await AsyncStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    return { ok: true };
  }

  async function entrar(email: string, senha: string): Promise<Resultado> {
    const emailNormalizado = email.trim().toLowerCase();
    const usuarios = await lerUsuarios();
    const encontrado = usuarios.find((u) => u.email === emailNormalizado && u.senha === senha);

    if (!encontrado) {
      return { ok: false, erro: 'E-mail ou senha incorretos.' };
    }

    await AsyncStorage.setItem(CHAVE_SESSAO, encontrado.email);
    setUsuario({ nome: encontrado.nome, email: encontrado.email });
    return { ok: true };
  }

  async function sair() {
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, cadastrar, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return contexto;
}