from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.movimentacao import TipoMovimentacao


class MovimentacaoEntrada(BaseModel):
    """Corpo do POST e do PUT. O usuario_id NÃO vem aqui: vem do token."""

    model_config = ConfigDict(str_strip_whitespace=True)

    descricao: str = Field(min_length=1, max_length=200)
    valor: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    data: date  # sem valor padrão = obrigatória
    tipo: TipoMovimentacao
    categoria_id: int | None = None

    @model_validator(mode="after")
    def categoria_so_em_despesa(self):
        if self.tipo == TipoMovimentacao.receita and self.categoria_id is not None:
            raise ValueError("Categoria só pode ser usada em despesas")
        return self


class MovimentacaoResposta(BaseModel):
    id: int
    descricao: str
    valor: Decimal
    data: date
    tipo: TipoMovimentacao
    categoria_id: int | None

    model_config = ConfigDict(from_attributes=True)