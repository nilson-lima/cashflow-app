from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.usuario import Usuario
from app.routes.dependencias import obter_usuario_logado
from app.schemas.usuario_schema import (
    TokenResposta,
    UsuarioCadastro,
    UsuarioLogin,
    UsuarioResposta,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/cadastro", response_model=UsuarioResposta, status_code=status.HTTP_201_CREATED)
def cadastro(dados: UsuarioCadastro, db: Session = Depends(get_db)):
    try:
        return auth_service.cadastrar(db, dados)
    except auth_service.EmailJaCadastradoError:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="E-mail já cadastrado")


@router.post("/login", response_model=TokenResposta)
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    try:
        token = auth_service.autenticar(db, dados)
    except auth_service.CredenciaisInvalidasError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResposta(access_token=token)


@router.get("/eu", response_model=UsuarioResposta)
def quem_sou_eu(usuario: Usuario = Depends(obter_usuario_logado)):
    """Rota protegida de teste: devolve o usuário dono do token."""
    return usuario