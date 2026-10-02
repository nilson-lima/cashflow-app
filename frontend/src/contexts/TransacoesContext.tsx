import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transacao } from '../models/Transacao';

const CHAVE = '@cashflow:transacoes';

type DadosTransacao = Omit<Transacao, 'id'>;

type TransacoesContextData = {
  transacoes: Transacao[];
  carregando: boolean;
  adicionarTransacao: (dados: DadosTransacao) => void;
  editarTransacao: (id: string, dados: DadosTransacao) => void;
  excluirTransacao: (id: string) => void;
};

const TransacoesContext = createContext<TransacoesContextData | undefined>(undefined);

export function TransacoesProvider({ children }: { children: React.ReactNode }) {
  const [lista, setLista] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Carrega as transações salvas ao abrir o app
  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((json) => {
        if (json) setLista(JSON.parse(json));
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  // Salva sempre que a lista mudar
  useEffect(() => {
    if (!carregando) {
      AsyncStorage.setItem(CHAVE, JSON.stringify(lista)).catch(() => {});
    }
  }, [lista, carregando]);

  // Mais recentes primeiro
  const transacoes = useMemo(
    () =>
      [...lista].sort((a, b) => {
        if (a.data === b.data) return Number(b.id) - Number(a.id);
        return a.data < b.data ? 1 : -1;
      }),
    [lista]
  );

  function adicionarTransacao(dados: DadosTransacao) {
    const nova: Transacao = { id: String(Date.now()), ...dados };
    setLista((atual) => [...atual, nova]);
  }

  function editarTransacao(id: string, dados: DadosTransacao) {
    setLista((atual) => atual.map((t) => (t.id === id ? { id, ...dados } : t)));
  }

  function excluirTransacao(id: string) {
    setLista((atual) => atual.filter((t) => t.id !== id));
  }

  return (
    <TransacoesContext.Provider
      value={{ transacoes, carregando, adicionarTransacao, editarTransacao, excluirTransacao }}
    >
      {children}
    </TransacoesContext.Provider>
  );
}

export function useTransacoes() {
  const contexto = useContext(TransacoesContext);
  if (!contexto) {
    throw new Error('useTransacoes deve ser usado dentro de TransacoesProvider');
  }
  return contexto;
}