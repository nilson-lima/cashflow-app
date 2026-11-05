import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não encontrada. Confira o arquivo backend/.env")

ALGORITMO = "HS256"
EXPIRACAO_MINUTOS = 60


def criar_token(usuario_id: int) -> str:
    agora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario_id),  # "sub" (subject) precisa ser texto
        "iat": agora,
        "exp": agora + timedelta(minutes=EXPIRACAO_MINUTOS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITMO)


def ler_token(token: str) -> int | None:
    """Devolve o id do usuário, ou None se o token for inválido ou expirado."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITMO])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None