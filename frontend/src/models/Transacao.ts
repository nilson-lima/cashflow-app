export type TipoTransacao = 'despesa' | 'receita';

export type Transacao = {
  id: number; // id criado pela API (número inteiro)
  tipo: TipoTransacao;
  valorCentavos: number; // R$ 250,00 = 25000
  descricao: string;
  categoriaId: number | null; // id da categoria na API (null = sem categoria)
  categoria: string; // nome para mostrar na tela ("Receita" para receitas)
  data: string; // formato AAAA-MM-DD
};