import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api, ApiError } from '../services/api';
import { useAuth } from './AuthContext';
import { valorApiParaCentavos } from '../utils/formatters';
import type { Transacao, TipoTransacao } from '../models/Transacao';

// Categoria como a API devolve em GET /categorias.
export type Categoria = { id: number; nome: string };

// Movimentação como a API devolve (o valor vem como texto, ex.: "1500.00").
type MovimentacaoApi = {
  id: number;
  descricao: string;
  valor: string;
  data: string; // AAAA-MM-DD
  tipo: TipoTransacao;
  categoria_id: number | null;
};

// Dados que as telas enviam ao salvar (o id é criado pela API).
export type DadosTransacao = {
  tipo: TipoTransacao;
  valorCentavos: number;
  descricao: string;
  categoriaId: number | null; // só vale para despesa
  data: string;
};

// Filtros aceitos na busca do Extrato (datas em AAAA-MM-DD, vazio = sem limite).
export type FiltrosBusca = {
  dataInicial?: string;
  dataFinal?: string;
  categoriaId?: number | null;
};

// Resultado das ações: ok:true, ou ok:false com a mensagem para mostrar na tela.
type Resultado = { ok: true } | { ok: false; erro: string };
type ResultadoBusca = { ok: true; dados: Transacao[] } | { ok: false; erro: string };

type TransacoesContextData = {
  transacoes: Transacao[];
  categorias: Categoria[]; // categorias que podem ser usadas em despesas
  carregando: boolean;
  erro: string | null; // mensagem se a lista não pôde ser carregada
  recarregar: () => Promise<void>;
  buscarTransacoes: (filtros: FiltrosBusca) => Promise<ResultadoBusca>;
  adicionarTransacao: (dados: DadosTransacao) => Promise<Resultado>;
  editarTransacao: (id: number, dados: DadosTransacao) => Promise<Resultado>;
  excluirTransacao: (id: number) => Promise<Resultado>;
};

const TransacoesContext = createContext<TransacoesContextData | undefined>(undefined);

function mensagemDoErro(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Ocorreu um erro inesperado.';
}

// Monta o corpo do POST/PUT. Receita nunca leva categoria (a API recusa).
function corpoParaApi(dados: DadosTransacao) {
  return {
    descricao: dados.descricao,
    valor: (dados.valorCentavos / 100).toFixed(2), // 25000 -> "250.00"
    data: dados.data,
    tipo: dados.tipo,
    categoria_id: dados.tipo === 'despesa' ? dados.categoriaId : null,
  };
}

// A categoria "Renda" existe na API, mas nunca pode ser usada pelo app.
function ehRenda(c: Categoria) {
  return c.nome.trim().toLowerCase() === 'renda';
}

// Converte uma movimentação da API para o formato que as telas usam.
function converter(m: MovimentacaoApi, nomes: Map<number, string>): Transacao {
  return {
    id: m.id,
    tipo: m.tipo,
    valorCentavos: valorApiParaCentavos(m.valor),
    descricao: m.descricao,
    categoriaId: m.categoria_id,
    categoria:
      m.tipo === 'receita'
        ? 'Receita'
        : m.categoria_id === null
          ? 'Sem categoria'
          : (nomes.get(m.categoria_id) ?? 'Sem categoria'),
    data: m.data,
  };
}

export function TransacoesProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoApi[]>([]);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Número da carga mais recente: descarta respostas antigas (ex.: depois de sair da conta).
  const versaoRef = useRef(0);

  // Busca movimentações e categorias na API.
  const recarregar = useCallback(async () => {
    const minhaVersao = ++versaoRef.current;
    setCarregando(true);
    setErro(null);
    try {
      const [lista, cats] = await Promise.all([
        api.get<MovimentacaoApi[]>('/movimentacoes'),
        api.get<Categoria[]>('/categorias'),
      ]);
      if (minhaVersao !== versaoRef.current) return;
      setMovimentacoes(lista);
      setTodasCategorias(cats);
    } catch (e) {
      if (minhaVersao !== versaoRef.current) return;
      setErro(mensagemDoErro(e));
    } finally {
      if (minhaVersao === versaoRef.current) setCarregando(false);
    }
  }, []);

  // Ao entrar na conta carrega os dados; ao sair, limpa tudo.
  useEffect(() => {
    if (!usuario) {
      versaoRef.current++; // descarta qualquer carga em andamento
      setMovimentacoes([]);
      setTodasCategorias([]);
      setErro(null);
      setCarregando(false);
      return;
    }
    recarregar();
  }, [usuario?.id, recarregar]);

  // Depois de salvar/editar/excluir, busca a lista de novo (a ordem vem da API).
  async function atualizarLista() {
    try {
      const lista = await api.get<MovimentacaoApi[]>('/movimentacoes');
      setMovimentacoes(lista);
    } catch {
      // A alteração já foi salva na API; a lista se atualiza na próxima carga.
    }
  }

  const categorias = useMemo(
    () => todasCategorias.filter((c) => !ehRenda(c)),
    [todasCategorias]
  );

  // id da categoria -> nome (usado para mostrar o nome nas telas)
  const nomes = useMemo(
    () => new Map<number, string>(todasCategorias.map((c) => [c.id, c.nome] as [number, string])),
    [todasCategorias]
  );

  // Lista completa no formato das telas, mais recentes primeiro.
  const transacoes = useMemo<Transacao[]>(
    () =>
      movimentacoes
        .map((m) => converter(m, nomes))
        .sort((a, b) => {
          if (a.data === b.data) return b.id - a.id;
          return a.data < b.data ? 1 : -1;
        }),
    [movimentacoes, nomes]
  );

  // Busca na API com filtros de período e categoria (usada pelo Extrato).
  // A API já devolve a lista ordenada (data e id, do mais recente para o mais antigo).
  const buscarTransacoes = useCallback(
    async (filtros: FiltrosBusca): Promise<ResultadoBusca> => {
      try {
        const lista = await api.get<MovimentacaoApi[]>('/movimentacoes', {
          params: {
            data_inicial: filtros.dataInicial,
            data_final: filtros.dataFinal,
            categoria_id: filtros.categoriaId,
          },
        });
        return { ok: true, dados: lista.map((m) => converter(m, nomes)) };
      } catch (e) {
        return { ok: false, erro: mensagemDoErro(e) };
      }
    },
    [nomes]
  );

  async function adicionarTransacao(dados: DadosTransacao): Promise<Resultado> {
    try {
      await api.post('/movimentacoes', corpoParaApi(dados));
      await atualizarLista();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: mensagemDoErro(e) };
    }
  }

  async function editarTransacao(id: number, dados: DadosTransacao): Promise<Resultado> {
    try {
      await api.put(`/movimentacoes/${id}`, corpoParaApi(dados));
      await atualizarLista();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: mensagemDoErro(e) };
    }
  }

  async function excluirTransacao(id: number): Promise<Resultado> {
    try {
      await api.delete(`/movimentacoes/${id}`);
      await atualizarLista();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: mensagemDoErro(e) };
    }
  }

  return (
    <TransacoesContext.Provider
      value={{
        transacoes,
        categorias,
        carregando,
        erro,
        recarregar,
        buscarTransacoes,
        adicionarTransacao,
        editarTransacao,
        excluirTransacao,
      }}
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