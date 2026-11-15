# CashFlow

Aplicativo mobile de controle financeiro pessoal, desenvolvido como projeto da disciplina **Projeto e Desenvolvimento de Sistemas de Informação 1 (PDSI 1)** — Bacharelado em Sistemas de Informação, Universidade Federal do Piauí (UFPI).

## 👥 Equipe

- Nilson Bruno dos Santos Lima ([@nilson-lima](https://github.com/nilson-lima))
- Luciano Ribeiro Leal ([@lucianoleal1987-rgb](https://github.com/lucianoleal1987-rgb))

**Professor:** Flávio Henrique Duarte de Araújo

## 📱 Sobre o projeto

O CashFlow ajuda o usuário a organizar suas receitas e despesas, acompanhar seu saldo e visualizar seus gastos por categoria, tudo em um só lugar.

A ideia é resolver um problema comum: a maioria das pessoas não tem o hábito de registrar e acompanhar os próprios gastos, o que leva a consumo acima da renda disponível e dificuldade em formar reservas financeiras.

### Funcionalidades

- Cadastro e login de usuários, com autenticação por token (JWT)
- Registro de receitas e despesas
- Classificação das despesas por categoria
- Edição e exclusão de movimentações
- Extrato com filtros por período e por categoria
- Saldo atual e resumo financeiro (receitas, despesas e saldo)
- Gráfico de despesas por categoria (semana, mês e ano)

## 🛠️ Tecnologias

**Front-end**

- React Native + TypeScript, com Expo (SDK 57)
- React Navigation
- `expo-secure-store` (guarda o token da sessão no celular)
- `react-native-svg` (gráficos)

**Back-end**

- Python 3 + FastAPI
- Uvicorn (servidor)
- SQLAlchemy (acesso ao banco)
- PostgreSQL (driver `psycopg2-binary`)
- PyJWT (token de login) e bcrypt (senhas)
- python-dotenv (variáveis de ambiente)

## 📁 Estrutura do repositório

```
CashFlow/
├── backend/     API (FastAPI)
├── frontend/    aplicativo mobile (Expo)
├── docs/        documentação (requisitos, casos de uso e diagrama de classes)
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
| `services/` | Regras de negócio. |
| `utils/` | Funções de apoio, como senha e token. |

Arquivos na raiz de `app/`:

- `main.py`: cria a aplicação FastAPI, reúne as rotas e, ao iniciar, cria as tabelas e cadastra as categorias padrão.

Arquivos na raiz de `backend/`:

- `requirements.txt`: dependências do projeto.
- `.env.example`: modelo das variáveis de ambiente (sem valores).
- `.env`: suas variáveis reais. **Não é versionado.**

### Regras de ouro

- **`routes` não tem lógica de negócio.** A rota só recebe a requisição, chama um service e devolve o resultado. Ela conhece HTTP e mais nada.
- **`services` não conhece HTTP.** O service aplica as regras de negócio e não sabe nada sobre requisições, respostas ou códigos de status.

### Convenções de nomes

- Arquivos em minúsculas, com `_` entre as palavras, no singular e com o sufixo da camada: `movimentacao_service.py`, `movimentacao_schema.py`, `movimentacao_route.py`, `movimentacao_model.py`.
- Funções e variáveis em `snake_case`.
- Classes em `PascalCase`.
- Nomes em português, de acordo com o domínio do projeto.

### Variáveis de ambiente

Definidas no arquivo `backend/.env` (copiado de `.env.example`):

| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | Endereço de conexão com o banco PostgreSQL. |
| `SECRET_KEY` | Chave usada para assinar os tokens de login. Cada pessoa gera a sua. |

Formato da `DATABASE_URL`:

```
postgresql+psycopg2://USUARIO:SENHA@localhost:5432/cashflow
```

Troque `USUARIO` e `SENHA` pelos do seu PostgreSQL. O banco se chama `cashflow`.

Para gerar a `SECRET_KEY`:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

O `.env` guarda segredos e **nunca** vai para o GitHub. Só o `.env.example` é versionado.

### Como rodar o back-end

Pré-requisitos: Python 3, PostgreSQL e Git. Os comandos abaixo são para Windows (PowerShell).

1. **Crie o banco vazio** no PostgreSQL (pelo pgAdmin ou pelo `psql`):
   ```sql
   CREATE DATABASE cashflow;
   ```
2. Entre na pasta do back-end:
   ```powershell
   cd backend
   ```
3. Crie o ambiente virtual:
   ```powershell
   python -m venv .venv
   ```
4. Ative o ambiente virtual (o prompt passa a mostrar `(.venv)`):
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
   Se o PowerShell bloquear o script, rode `Set-ExecutionPolicy -Scope Process RemoteSigned` e tente de novo.
5. Instale as dependências:
   ```powershell
   pip install -r requirements.txt
   ```
6. Crie o seu arquivo `.env` a partir do modelo e preencha as duas variáveis:
   ```powershell
   Copy-Item .env.example .env
   ```
7. Suba o servidor:
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0
   ```
   O `--host 0.0.0.0` é necessário para o celular conseguir acessar a API pela rede. Se for usar só o navegador do computador, pode ser omitido.
8. Confira se está tudo certo:
   - Abra [http://127.0.0.1:8000/saude](http://127.0.0.1:8000/saude). Deve aparecer `{"status": "banco conectado"}`.
   - A documentação interativa (Swagger) fica em [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Na primeira vez que a API sobe, ela **cria as tabelas sozinha** e cadastra as categorias padrão: Alimentação, Moradia, Transporte, Lazer, Saúde e Renda. Não é preciso criar nada à mão além do banco vazio.

### Rotas disponíveis

Os valores monetários saem como texto no JSON (por exemplo, `"1500.00"`) e as datas usam o formato `AAAA-MM-DD`.

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/` | Teste de vida da API. |
| GET | `/saude` | Confirma que a API está conectada ao banco. |
| POST | `/auth/cadastro` | Cadastra um usuário (`nome`, `email`, `senha` com 8 a 72 caracteres). |
| POST | `/auth/login` | Faz login e devolve o `access_token`. |
| GET | `/auth/eu` | Devolve os dados do usuário logado. |
| GET | `/categorias` | Lista as categorias. A categoria Renda não pode ser usada pelo app. |
| POST | `/movimentacoes` | Cria uma receita ou despesa. Só despesa pode ter `categoria_id`. |
| GET | `/movimentacoes` | Lista as movimentações. Filtros opcionais: `data_inicial`, `data_final`, `categoria_id` e `tipo`. |
| GET | `/movimentacoes/{id}` | Busca uma movimentação. |
| PUT | `/movimentacoes/{id}` | Edita uma movimentação. |
| DELETE | `/movimentacoes/{id}` | Exclui uma movimentação. |
| GET | `/resumo` | Total de receitas, total de despesas, saldo e despesas por categoria. Filtros opcionais: `mes` e `ano`. |
| GET | `/graficos/categorias` | Despesas por categoria, com percentuais. Parâmetros: `periodo` (`semana`, `mes` ou `ano`) e `data_referencia`. |

**Autenticação:** as rotas `/auth/eu`, `/movimentacoes`, `/resumo` e `/graficos/categorias` exigem o token no cabeçalho `Authorization: Bearer <token>`. No Swagger, use o botão **Authorize** e cole só o token, sem escrever `Bearer`. O token expira, e a API responde `401` quando ele é inválido ou está vencido.

**Erros comuns:**

| Código | Quando acontece |
|---|---|
| `401` | Token inválido ou expirado, ou e-mail ou senha incorretos no login. |
| `404` | Movimentação inexistente ou de outro usuário. |
| `409` | E-mail já cadastrado. |
| `422` | Dados inválidos, como valor menor ou igual a zero, senha curta, categoria em receita, ou data inicial depois da final. |

**Observações:**

- No `/resumo`, informar o `mes` sem o `ano` resulta em erro `422`.
- Em `/graficos/categorias`, a semana vai de segunda a domingo. Se o parâmetro `periodo` não for informado, a API considera todo o histórico de despesas do usuário e devolve `periodo`, `data_inicial` e `data_final` nulos. O aplicativo sempre envia o período.
- Despesa sem categoria aparece como "Sem categoria" nos gráficos.

### Segurança

- As senhas são guardadas com hash **bcrypt**. A API nunca devolve a senha nem o hash.
- Cada usuário só enxerga, edita e exclui as próprias movimentações.

## 📱 Front-end (aplicativo)

Aplicativo feito com **Expo** e **React Native**, em `frontend/`. Ele conversa com a API do back-end.

### Como rodar o front-end

Pré-requisitos: Node.js, o **back-end rodando** (com `--host 0.0.0.0`) e um celular com o **Expo Go**.

1. Descubra o IP do seu computador na rede Wi-Fi:
   ```powershell
   ipconfig
   ```
   Na seção do adaptador **Wi-Fi**, anote o **Endereço IPv4** (por exemplo, `192.168.0.10`).
2. Abra o arquivo `frontend/src/config.ts` e coloque esse IP:
   ```ts
   export const API_URL = 'http://SEU_IP:8000';
   ```
   O IP muda de uma rede para outra. Se o app parar de conectar, confira o IP de novo. **Não faça commit** dessa alteração, porque ela vale só para a sua máquina.
3. Entre na pasta do front-end e instale as dependências:
   ```powershell
   cd frontend
   npm install
   ```
4. Inicie o Expo:
   ```powershell
   npx expo start
   ```
5. No celular, abra o **Expo Go** e escaneie o **QR code** que aparece no terminal.

**Atenção:**

- O computador e o celular precisam estar no **mesmo Wi-Fi**.
- O projeto usa o **Expo SDK 57**. Se o Expo Go da Play Store estiver numa versão mais nova, aparece o erro "Project is incompatible with this version of Expo Go". Nesse caso, instale o Expo Go do SDK 57 em [expo.dev/go](https://expo.dev/go) e desative a atualização automática dele.
- Como a API usa a porta 8000, deixe o terminal dela aberto e use **outro terminal** para o Expo.

## 📄 Documentação

Na pasta `docs/` estão a apresentação da aplicação, a especificação dos requisitos (RF01 a RF13), o diagrama de casos de uso e o diagrama de classes.

## 🔄 Fluxo de trabalho da equipe

- Uma branch por tarefa, no padrão `feature/...`.
- Commits pequenos, com mensagens no padrão `feat: ...`.
- Pull request com `Closes #N` na primeira linha da descrição, para vincular a issue.
- Quem instalar um pacote novo avisa a equipe e atualiza o `requirements.txt` (back-end) ou o `package.json` (front-end).
- Nunca commitar `.env`, `.venv` ou `__pycache__`.

## ✅ Status do projeto

- ✅ Back-end: autenticação, categorias, movimentações, filtros, resumo e gráficos
- ✅ Aplicativo integrado à API: login, cadastro, lançamentos, edição, exclusão, filtros, resumo e gráficos
- ⏳ Testes finais e documentação (em andamento)

## 📝 Licença

Veja o arquivo [LICENSE](LICENSE).