from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.usuario import Usuario
from app.routes.dependencias import obter_usuario_logado
from app.schemas.resumo_schema import ResumoResposta
from app.services import resumo_service as service

router = APIRouter(prefix="/resumo", tags=["Resumo"])


@router.get("", response_model=ResumoResposta)
def obter_resumo(
    mes: int | None = Query(None, ge=1, le=12),
    ano: int | None = Query(None, ge=2000, le=2100),
    usuario: Usuario = Depends(obter_usuario_logado),
    db: Session = Depends(get_db),
):

    if mes is not None and ano is None:
        raise HTTPException(status_code=422, detail="Informe o ano junto com o mês")
    return service.obter_resumo(db, usuario.id, mes, ano)
