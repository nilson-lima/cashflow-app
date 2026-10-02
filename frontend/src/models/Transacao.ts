export type TipoTransacao = 'despesa' | 'receita';

export type Transacao = {
  id: string;
  tipo: TipoTransacao;
  valorCentavos: number; // R$ 250,00 = 25000
  descricao: string;
  categoria: string;
  data: string; // formato AAAA-MM-DD
};