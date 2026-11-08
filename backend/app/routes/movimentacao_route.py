from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.movimentacao import TipoMovimentacao
from app.models.usuario import Usuario
from app.routes.dependencias import obter_usuario_logado
from app.schemas.movimentacao_schema import MovimentacaoEntrada, MovimentacaoResposta
from app.services import movimentacao_service as service

router = APIRouter(prefix="/movimentacoes", tags=["Movimentações"])

NAO_ENCONTRADA = HTTPException(404, detail="Movimentação não encontrada")
CATEGORIA_INVALIDA = HTTPException(422, detail="Categoria não encontrada")


@router.post("", response_model=MovimentacaoResposta, status_code=status.HTTP_201_CREATED)
def criar(
    dados: MovimentacaoEntrada,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_logado),
):
    try:
        return service.criar(db, usuario.id, dados)
    except service.CategoriaInvalidaError:
        raise CATEGORIA_INVALIDA


@router.get("", response_model=list[MovimentacaoResposta])
def listar(
    data_inicial: date | None = None,
    data_final: date | None = None,
    categoria_id: int | None = None,
    tipo: TipoMovimentacao | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_logado),
):
    # Um período invertido nunca devolveria nada: melhor avisar do que devolver lista vazia.
    if data_inicial is not None and data_final is not None and data_inicial > data_final:
        raise HTTPException(
            status_code=422, detail="data_inicial não pode ser depois de data_final"
        )
    return service.listar(db, usuario.id, data_inicial, data_final, categoria_id, tipo)


@router.get("/{movimentacao_id}", response_model=MovimentacaoResposta)
def detalhar(
    movimentacao_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_logado),
):
    try:
        return service.buscar(db, usuario.id, movimentacao_id)
    except service.MovimentacaoNaoEncontradaError:
        raise NAO_ENCONTRADA


@router.put("/{movimentacao_id}", response_model=MovimentacaoResposta)
def atualizar(
    movimentacao_id: int,
    dados: MovimentacaoEntrada,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_logado),
):
    try:
        return service.atualizar(db, usuario.id, movimentacao_id, dados)
    except service.MovimentacaoNaoEncontradaError:
        raise NAO_ENCONTRADA
    except service.CategoriaInvalidaError:
        raise CATEGORIA_INVALIDA


@router.delete("/{movimentacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    movimentacao_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_logado),
):
    try:
        service.excluir(db, usuario.id, movimentacao_id)
    except service.MovimentacaoNaoEncontradaError:
        raise NAO_ENCONTRADA