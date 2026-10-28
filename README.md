# CashFlow

Aplicativo mobile de controle financeiro pessoal, desenvolvido como projeto da disciplina **Projeto e Desenvolvimento de Sistemas de Informação 1 (PDSI 1)** — Bacharelado em Sistemas de Informação, Universidade Federal do Piauí (UFPI).

## 👥 Equipe

- Nilson Bruno dos Santos Lima ([@nilson-lima](https://github.com/nilson-lima))
- Luciano Ribeiro Leal

**Professor:** Flávio Henrique Duarte de Araújo

## 📱 Sobre o projeto

O CashFlow vai ajudar o usuário a organizar suas receitas e despesas, acompanhar seu saldo e visualizar seus gastos por categoria, tudo em um só lugar.

A ideia é resolver um problema comum: a maioria das pessoas não tem o hábito de registrar e acompanhar os próprios gastos, o que leva a consumo acima da renda disponível e dificuldade em formar reservas financeiras.

## 🛠️ Tecnologias

**Front-end**

- React Native + TypeScript (via Expo)
- Firebase (autenticação e banco de dados)

**Back-end**

- Python 3 + FastAPI
- Uvicorn (servidor)
- SQLAlchemy (acesso ao banco)
- PostgreSQL (psycopg2-binary)
- python-dotenv (variáveis de ambiente)

## 📁 Estrutura do repositório

```
CashFlow/
├── backend/     API (FastAPI)
├── frontend/    aplicativo mobile (Expo)
├── docs/        documentação
├── README.md
├── LICENSE
└── .gitignore
```

## ⚙️ Back-end (API)

API do CashFlow construída com **FastAPI**, **SQLAlchemy** e **PostgreSQL**. Todo o código fica em `backend/`.

### Fluxo da requisição

```
requisição -> routes -> services -> models/database
                 ^
          schemas (validam entrada e saída)
```

1. A requisição HTTP chega a uma **rota** (`routes/`).
2. Os **schemas** validam os dados que entram e formatam os dados que saem.
3. A rota chama um **service** (`services/`), que aplica as regras de negócio.
4. O service usa os **models** e o **database** para ler e gravar no banco.

### Estrutura de pastas

Tudo dentro de `backend/app/`:

| Pasta | Papel |
|---|---|
| `database/` | Conexão com o banco de dados. |
| `models/` | Tabelas do banco (SQLAlchemy). |
| `schemas/` | Validação dos dados de entrada e saída da API. |
| `routes/` | Rotas HTTP. Recebem a requisição, chamam um service e devolvem a resposta. |
| `services/` | Regras de negócio, como o cálculo do fechamento de caixa. |
| `utils/` | Funções de apoio, como senha e token. |

Arquivos na raiz de `app/`:

- `main.py`: cria a aplicação FastAPI e reúne as rotas. Só o responsável pelo setup da API mexe nele.

Arquivos na raiz de `backend/`:

- `requirements.txt`: dependências do projeto.
- `.env.example`: modelo das variáveis de ambiente (sem valores).
- `.env`: suas variáveis reais. **Não é versionado.**

### Regras de ouro

- **`routes` não tem lógica de negócio.** A rota só recebe a requisição, chama um service e devolve o resultado. Ela conhece HTTP e mais nada.
- **`services` não conhece HTTP nem banco.** O service recebe dados já prontos e devolve o resultado do cálculo. Quem busca e grava os dados é outra camada.

Por quê: assim a lógica do fechamento de caixa fica isolada. Ela pode ser testada sem subir servidor nem banco, e reaproveitada se o fechamento for pedido por outro caminho (outra rota, um relatório).

### Convenções de nomes

- Arquivos em minúsculas, com `_` entre as palavras, no singular e com o sufixo da camada: `venda_service.py`, `venda_schema.py`, `venda_route.py`, `venda_model.py`.
- Funções e variáveis em `snake_case`: `calcular_fechamento`, `total_por_forma_pagamento`.
- Classes em `PascalCase`: `Venda`, `VendaCriar`.
- Nomes em português, de acordo com o domínio do projeto (venda, fechamento, forma de pagamento).

### Variáveis de ambiente

Definidas no arquivo `backend/.env` (copiado de `.env.example`):

| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | Endereço de conexão com o banco PostgreSQL. |
| `SECRET_KEY` | Chave usada para assinar tokens de login. Cada pessoa gera a sua. |

Para gerar a `SECRET_KEY`:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

O `.env` guarda segredos e **nunca** vai para o GitHub. Só o `.env.example` é versionado.

### Como rodar

Pré-requisitos: Python 3 e Git. Os comandos abaixo são para Windows (PowerShell).

1. Entre na pasta do back-end:
   ```powershell
   cd backend
   ```
2. Crie o ambiente virtual:
   ```powershell
   python -m venv .venv
   ```
3. Ative o ambiente virtual:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
   Se o PowerShell bloquear o script, rode `Set-ExecutionPolicy -Scope Process RemoteSigned` e tente de novo.
4. Instale as dependências:
   ```powershell
   pip install -r requirements.txt
   ```
5. Crie o seu arquivo `.env` a partir do modelo e preencha as duas variáveis (veja a seção anterior):
   ```powershell
   Copy-Item .env.example .env
   ```
6. Suba o servidor:
   ```powershell
   uvicorn app.main:app --reload
   ```
7. Abra a documentação interativa em [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Rotas disponíveis

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/` | Teste de vida da API. Devolve `{"mensagem": "API do CashFlow no ar"}`. |

### Fluxo de trabalho da equipe

- Uma branch por tarefa, no padrão `feature/...`.
- Commits pequenos e `git pull` antes do `git push`.
- Quem instalar um pacote novo avisa a equipe e atualiza o `requirements.txt` com `pip freeze`.
- Nunca commitar `.env`, `.venv` ou `__pycache__`.

### Status do back-end

- ✅ Estrutura inicial da API (servidor rodando e `/docs` acessível)
- 🔄 Arquitetura e organização do back-end (pastas e documentação)
- ⏳ Conexão com o PostgreSQL e rota `/saude`
- ⏳ Models, schemas e rotas
- ⏳ Serviço de fechamento de caixa, com testes
- ⏳ Autenticação (senha + JWT)

---

*Documentação em construção — mais detalhes em breve.*