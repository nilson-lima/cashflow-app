from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.usuario import Usuario
from app.routes.dependencias import obter_usuario_logado
from app.schemas.categoria_schema import CategoriaResposta
from app.services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("", response_model=list[CategoriaResposta])
def listar(
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(obter_usuario_logado),  # exige login
):
    return categoria_service.listar(db)