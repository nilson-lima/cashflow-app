from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioCadastro, UsuarioLogin
from app.utils.senha import gerar_hash, verificar_senha
from app.utils.token import criar_token


class EmailJaCadastradoError(Exception):
    pass


class CredenciaisInvalidasError(Exception):
    pass


# Hash usado quando o e-mail não existe, para o login levar o mesmo tempo
# nos dois casos (evita descobrir e-mails cadastrados pelo tempo de resposta).
_HASH_FALSO = gerar_hash("senha-falsa-para-igualar-o-tempo")


def buscar_por_email(db: Session, email: str) -> Usuario | None:
    return db.scalar(select(Usuario).where(Usuario.email == email))


def cadastrar(db: Session, dados: UsuarioCadastro) -> Usuario:
    if buscar_por_email(db, dados.email):
        raise EmailJaCadastradoError()

    usuario = Usuario(
        nome=dados.nome.strip(),
        email=dados.email,
        senha_hash=gerar_hash(dados.senha),
    )
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError:  # duas requisições com o mesmo e-mail ao mesmo tempo
        db.rollback()
        raise EmailJaCadastradoError()
    db.refresh(usuario)
    return usuario


def autenticar(db: Session, dados: UsuarioLogin) -> str:
    usuario = buscar_por_email(db, dados.email)
    senha_hash = usuario.senha_hash if usuario else _HASH_FALSO
    senha_correta = verificar_senha(dados.senha, senha_hash)

    if usuario is None or not senha_correta:
        raise CredenciaisInvalidasError()
    return criar_token(usuario.id)