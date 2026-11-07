from decimal import Decimal

from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.movimentacao import Movimentacao, TipoMovimentacao


def _montar_filtros(usuario_id: int, mes: int | None, ano: int | None) -> list:
    """Monta as condições do WHERE: sempre o usuário, e o período se informado."""
    filtros = [Movimentacao.usuario_id == usuario_id]
    if ano is not None:
        filtros.append(extract("year", Movimentacao.data) == ano)
    if mes is not None:
        filtros.append(extract("month", Movimentacao.data) == mes)
    return filtros


def obter_resumo(
    db: Session, usuario_id: int, mes: int | None = None, ano: int | None = None
) -> dict:
    filtros = _montar_filtros(usuario_id, mes, ano)

    linhas_totais = db.execute(
        select(Movimentacao.tipo, func.sum(Movimentacao.valor))
        .where(*filtros)
        .group_by(Movimentacao.tipo)
    ).all()
    totais = {tipo: total for tipo, total in linhas_totais}

    total_receitas = totais.get(TipoMovimentacao.receita, Decimal("0.00"))
    total_despesas = totais.get(TipoMovimentacao.despesa, Decimal("0.00"))

    total_categoria = func.sum(Movimentacao.valor)
    linhas_categorias = db.execute(
        select(Categoria.nome, total_categoria)
        .select_from(Movimentacao)
        .outerjoin(Categoria, Movimentacao.categoria_id == Categoria.id)
        .where(*filtros, Movimentacao.tipo == TipoMovimentacao.despesa)
        .group_by(Categoria.nome)
        .order_by(total_categoria.desc())
    ).all()

    return {
        "total_receitas": total_receitas,
        "total_despesas": total_despesas,
        "saldo": total_receitas - total_despesas,
        "despesas_por_categoria": [
            {"categoria": nome or "Sem categoria", "total": total}
            for nome, total in linhas_categorias
        ],
    }