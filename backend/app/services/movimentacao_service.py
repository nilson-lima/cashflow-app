from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.movimentacao import Movimentacao
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


def listar(db: Session, usuario_id: int) -> list[Movimentacao]:
    consulta = (
        select(Movimentacao)
        .where(Movimentacao.usuario_id == usuario_id)
        .order_by(Movimentacao.data.desc(), Movimentacao.id.desc())
    )
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