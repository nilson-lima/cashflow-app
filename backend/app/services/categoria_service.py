from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria


def listar(db: Session) -> list[Categoria]:
    return list(db.scalars(select(Categoria).order_by(Categoria.id)))