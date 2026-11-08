from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.movimentacao import Movimentacao, TipoMovimentacao
from app.schemas.movimentacao_schema import MovimentacaoEntrada


class MovimentacaoNaoEncontradaError(Exception):
    pass


class CategoriaInvalidaError(Exception):
    pass


def _validar_categoria(db: Session, categoria_id: int | None) -> None:
    if categoria_id is not None and db.get(Categoria, categoria_id) is None:
        raise CategoriaInvalidaError()


def buscar(db: Session, usuario_id: int, movimentacao_id: int) -> Movimentacao:
    # Busca pelo par (id, usuario_id): movimentação de outro usuário
    # é tratada exatamente como se não existisse.
    movimentacao = db.scalar(
        select(Movimentacao).where(
            Movimentacao.id == movimentacao_id,
            Movimentacao.usuario_id == usuario_id,
        )
    )
    if movimentacao is None:
        raise MovimentacaoNaoEncontradaError()
    return movimentacao


def listar(
    db: Session,
    usuario_id: int,
    data_inicial: date | None = None,
    data_final: date | None = None,
    categoria_id: int | None = None,
    tipo: TipoMovimentacao | None = None,
) -> list[Movimentacao]:
    # Sempre filtra pelo usuário; os demais filtros só entram se foram informados.
    consulta = select(Movimentacao).where(Movimentacao.usuario_id == usuario_id)
    if data_inicial is not None:
        consulta = consulta.where(Movimentacao.data >= data_inicial)
    if data_final is not None:
        consulta = consulta.where(Movimentacao.data <= data_final)
    if categoria_id is not None:
        consulta = consulta.where(Movimentacao.categoria_id == categoria_id)
    if tipo is not None:
        consulta = consulta.where(Movimentacao.tipo == tipo)
    consulta = consulta.order_by(Movimentacao.data.desc(), Movimentacao.id.desc())
    return list(db.scalars(consulta))


def criar(db: Session, usuario_id: int, dados: MovimentacaoEntrada) -> Movimentacao:
    _validar_categoria(db, dados.categoria_id)
    movimentacao = Movimentacao(**dados.model_dump(), usuario_id=usuario_id)
    db.add(movimentacao)
    db.commit()
    db.refresh(movimentacao)
    return movimentacao


def atualizar(
    db: Session, usuario_id: int, movimentacao_id: int, dados: MovimentacaoEntrada
) -> Movimentacao:
    movimentacao = buscar(db, usuario_id, movimentacao_id)
    _validar_categoria(db, dados.categoria_id)
    for campo, valor in dados.model_dump().items():
        setattr(movimentacao, campo, valor)
    db.commit()
    db.refresh(movimentacao)
    return movimentacao


def excluir(db: Session, usuario_id: int, movimentacao_id: int) -> None:
    movimentacao = buscar(db, usuario_id, movimentacao_id)
    db.delete(movimentacao)
    db.commit()