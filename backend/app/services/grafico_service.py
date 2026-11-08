import calendar
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.movimentacao import Movimentacao, TipoMovimentacao
from app.schemas.grafico_schema import PeriodoGrafico

CEM = Decimal("100.00")
CENTAVOS = Decimal("0.01")


def calcular_intervalo(
    periodo: PeriodoGrafico | None, data_referencia: date | None
) -> tuple[date | None, date | None]:
    """Transforma 'semana/mes/ano' em data inicial e data final (inclusive)."""
    if periodo is None:
        return None, None

    # Sem data de referência, usa o dia de hoje.
    referencia = data_referencia or date.today()

    if periodo == PeriodoGrafico.semana:
        # weekday() devolve 0 na segunda-feira, então a semana vai de segunda a domingo.
        inicio = referencia - timedelta(days=referencia.weekday())
        return inicio, inicio + timedelta(days=6)

    if periodo == PeriodoGrafico.mes:
        ultimo_dia = calendar.monthrange(referencia.year, referencia.month)[1]
        return referencia.replace(day=1), referencia.replace(day=ultimo_dia)

    # Último caso possível: ano.
    return date(referencia.year, 1, 1), date(referencia.year, 12, 31)


def obter_categorias(
    db: Session,
    usuario_id: int,
    periodo: PeriodoGrafico | None = None,
    data_referencia: date | None = None,
) -> dict:
    data_inicial, data_final = calcular_intervalo(periodo, data_referencia)

    # Só despesas do usuário logado.
    filtros = [
        Movimentacao.usuario_id == usuario_id,
        Movimentacao.tipo == TipoMovimentacao.despesa,
    ]
    if data_inicial is not None:
        filtros.append(Movimentacao.data >= data_inicial)
        filtros.append(Movimentacao.data <= data_final)

    # Total gasto por categoria, do maior para o menor.
    # outerjoin mantém as despesas sem categoria (categoria_id vazio).
    total_categoria = func.sum(Movimentacao.valor)
    linhas = db.execute(
        select(Categoria.nome, total_categoria)
        .select_from(Movimentacao)
        .outerjoin(Categoria, Movimentacao.categoria_id == Categoria.id)
        .where(*filtros)
        .group_by(Categoria.nome)
        .order_by(total_categoria.desc(), Categoria.nome)
    ).all()

    # O total vem da soma das categorias: assim o gráfico sempre bate com ele.
    total_despesas = sum((total for _, total in linhas), Decimal("0.00"))

    categorias = []
    acumulado = Decimal("0.00")
    for posicao, (nome, total) in enumerate(linhas):
        if posicao == len(linhas) - 1:
            # A última fatia recebe o que falta para fechar 100.00,
            # compensando os arredondamentos das anteriores.
            percentual = CEM - acumulado
        else:
            percentual = (total / total_despesas * 100).quantize(CENTAVOS)
            acumulado += percentual
        categorias.append(
            {
                "categoria": nome or "Sem categoria",
                "total": total,
                "percentual": percentual,
            }
        )

    return {
        "periodo": periodo,
        "data_inicial": data_inicial,
        "data_final": data_final,
        "total_despesas": total_despesas,
        "categorias": categorias,
    }