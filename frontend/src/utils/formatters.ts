export function formatarMoeda(centavos: number) {
  const negativo = centavos < 0;
  const abs = Math.abs(centavos);
  const reais = Math.floor(abs / 100);
  const resto = String(abs % 100).padStart(2, '0');
  const inteiro = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negativo ? '-' : ''}R$ ${inteiro},${resto}`;
}

function paraISO(d: Date) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function dataHojeISO() {
  return paraISO(new Date());
}

export function isoParaBR(iso: string) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Retorna AAAA-MM-DD, ou null se a data for inválida
export function brParaISO(br: string): string | null {
  const partes = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const d = new Date(ano, mes - 1, dia);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) {
    return null;
  }
  return paraISO(d);
}

export function rotuloData(iso: string) {
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  if (iso === paraISO(hoje)) return 'Hoje';
  if (iso === paraISO(ontem)) return 'Ontem';
  return isoParaBR(iso);
}