from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.usuario import Usuario
from app.utils.token import ler_token

esquema_bearer = HTTPBearer()


def obter_usuario_logado(
    credenciais: HTTPAuthorizationCredentials = Depends(esquema_bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    erro = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    usuario_id = ler_token(credenciais.credentials)
    if usuario_id is None:
        raise erro

    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise erro
    return usuario