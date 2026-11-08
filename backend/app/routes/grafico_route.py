from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.usuario import Usuario
from app.routes.dependencias import obter_usuario_logado
from app.schemas.grafico_schema import GraficoCategoriasResposta, PeriodoGrafico
from app.services import grafico_service as service

router = APIRouter(prefix="/graficos", tags=["Gráficos"])


@router.get("/categorias", response_model=GraficoCategoriasResposta)
def categorias(
    periodo: PeriodoGrafico | None = None,
    data_referencia: date | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_logado),
):
    # Uma data de referência sem período não faz sentido: não há o que calcular.
    if data_referencia is not None and periodo is None:
        raise HTTPException(
            status_code=422, detail="Informe o periodo junto com a data_referencia"
        )
    return service.obter_categorias(db, usuario.id, periodo, data_referencia)