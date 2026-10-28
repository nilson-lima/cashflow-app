from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

import app.models
from app.database.connection import Base, SessionLocal, engine, get_db
from app.models.categoria import Categoria

CATEGORIAS_PADRAO = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Lazer",
    "Saúde",
    "Renda",
]


def cadastrar_categorias_padrao():
    db = SessionLocal()
    try:
        for nome in CATEGORIAS_PADRAO:
            existe = db.query(Categoria).filter_by(nome=nome).first()
            if existe is None:
                db.add(Categoria(nome=nome))
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    cadastrar_categorias_padrao()
    yield


app = FastAPI(title="CashFlow API", lifespan=lifespan)


@app.get("/")
def raiz():
    return {"mensagem": "API do CashFlow no ar"}


@app.get("/saude")
def saude(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "banco conectado"}
