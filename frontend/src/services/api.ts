import { API_URL } from '../config';
import { lerToken } from './tokenStorage';

// Erro lançado quando a API responde com falha.
// status 0 = nem chegou a falar com o servidor (sem conexão ou tempo esgotado).
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Parametros = Record<string, string | number | boolean | null | undefined>;

type Opcoes = {
  corpo?: unknown; // objeto que vira JSON no corpo da requisição
  params?: Parametros; // vira query string (?a=1&b=2)
  comToken?: boolean; // false em login/cadastro (ainda não há token)
};

// O AuthContext registra aqui o que fazer quando o token for recusado (401).
let aoNaoAutorizado: (() => void) | null = null;

export function definirAoNaoAutorizado(fn: (() => void) | null): void {
  aoNaoAutorizado = fn;
}

const TEMPO_LIMITE_MS = 10000; // 10 segundos

// Monta "?chave=valor&..." ignorando parâmetros vazios.
function montarQuery(params?: Parametros): string {
  if (!params) return '';
  const partes: string[] = [];
  for (const [chave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === null || valor === '') continue;
    partes.push(`${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`);
  }
  return partes.length > 0 ? `?${partes.join('&')}` : '';
}

// A API manda a mensagem em "detail". Se for texto, usamos direto.
// No 422 o "detail" é uma lista técnica, então mostramos um texto genérico.
function extrairMensagem(dados: any, status: number): string {
  if (dados && typeof dados.detail === 'string') return dados.detail;
  if (status === 422) return 'Dados inválidos. Confira os campos e tente novamente.';
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

async function requisicao<T>(
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE',
  caminho: string,
  opcoes: Opcoes = {}
): Promise<T> {
  const { corpo, params, comToken = true } = opcoes;

  const cabecalhos: Record<string, string> = {};
  let tokenEnviado = false;

  // Anexa o token automaticamente, se existir.
  if (comToken) {
    const token = await lerToken();
    if (token) {
      cabecalhos.Authorization = `Bearer ${token}`;
      tokenEnviado = true;
    }
  }

  if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
  }

  // Cancela a requisição se passar do tempo limite.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}${montarQuery(params)}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controlador.signal,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor.');
  } finally {
    clearTimeout(temporizador);
  }

  // 204 = sucesso sem corpo (ex.: DELETE).
  if (resposta.status === 204) {
    return undefined as T;
  }

  // Tenta ler o JSON; se a resposta não for JSON, fica null.
  let dados: any = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    // Token enviado e recusado: sessão expirou ou é inválida.
    if (resposta.status === 401 && tokenEnviado && aoNaoAutorizado) {
      aoNaoAutorizado();
    }
    throw new ApiError(resposta.status, extrairMensagem(dados, resposta.status));
  }

  return dados as T;
}

// Atalhos usados pelo resto do app: api.get('/resumo', { params: {...} })
export const api = {
  get: <T>(caminho: string, opcoes?: Opcoes) => requisicao<T>('GET', caminho, opcoes),
  post: <T>(caminho: string, corpo?: unknown, opcoes?: Opcoes) =>
    requisicao<T>('POST', caminho, { ...opcoes, corpo }),
  put: <T>(caminho: string, corpo?: unknown, opcoes?: Opcoes) =>
    requisicao<T>('PUT', caminho, { ...opcoes, corpo }),
  delete: <T = void>(caminho: string, opcoes?: Opcoes) =>
    requisicao<T>('DELETE', caminho, opcoes),
};