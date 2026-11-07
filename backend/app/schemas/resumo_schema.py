from decimal import Decimal

from pydantic import BaseModel


class DespesaPorCategoria(BaseModel):
    
    categoria: str
    total: Decimal


class ResumoResposta(BaseModel):

    total_receitas: Decimal
    total_despesas: Decimal
    saldo: Decimal  
    despesas_por_categoria: list[DespesaPorCategoria]