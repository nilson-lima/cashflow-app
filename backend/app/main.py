
from fastapi import FastAPI

app = FastAPI(title="CashFlow API")


@app.get("/")
def raiz():
    return {"mensagem": "API do CashFlow no ar"}