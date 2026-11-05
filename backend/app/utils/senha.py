import bcrypt

LIMITE_BYTES = 72  # o bcrypt só considera os 72 primeiros bytes da senha


def gerar_hash(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    senha_bytes = senha.encode("utf-8")
    if len(senha_bytes) > LIMITE_BYTES:
        return False
    return bcrypt.checkpw(senha_bytes, senha_hash.encode("utf-8"))