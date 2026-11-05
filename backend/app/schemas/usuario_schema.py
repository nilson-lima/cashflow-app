from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UsuarioCadastro(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def email_minusculo(cls, valor: str) -> str:
        return valor.lower()

    @field_validator("senha")
    @classmethod
    def senha_cabe_no_bcrypt(cls, valor: str) -> str:
        if len(valor.encode("utf-8")) > 72:
            raise ValueError("A senha deve ter no máximo 72 bytes")
        return valor


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def email_minusculo(cls, valor: str) -> str:
        return valor.lower()


class UsuarioResposta(BaseModel):
    id: int
    nome: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)  # nunca inclui a senha


class TokenResposta(BaseModel):
    access_token: str
    token_type: str = "bearer"