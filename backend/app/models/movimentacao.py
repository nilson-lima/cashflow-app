import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class TipoMovimentacao(str, enum.Enum):
    receita = "receita"
    despesa = "despesa"


class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id: Mapped[int] = mapped_column(primary_key=True)
    descricao: Mapped[str] = mapped_column(String(200))
    valor: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    data: Mapped[date] = mapped_column(Date)
    tipo: Mapped[TipoMovimentacao] = mapped_column(Enum(TipoMovimentacao))
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    categoria_id: Mapped[int | None] = mapped_column(ForeignKey("categorias.id"), nullable=True)