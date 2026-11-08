import enum
from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class PeriodoGrafico(str, enum.Enum):
    """Períodos aceitos pelo gráfico."""
    semana = "semana"
    mes = "mes"
    ano = "ano"


class CategoriaGrafico(BaseModel):
    """Uma fatia do gráfico: total gasto na categoria e sua fatia do total."""
    categoria: str
    total: Decimal
    percentual: Decimal


class GraficoCategoriasResposta(BaseModel):
    """Dados do gráfico de despesas por categoria."""
    periodo: PeriodoGrafico | None
    data_inicial: date | None
    data_final: date | None
    total_despesas: Decimal
    categorias: list[CategoriaGrafico]