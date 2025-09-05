# Microsserviço TOP Finance

> Responsável pelo gerenciamento de finanças da plataforma.

## 📜 Sobre o Projeto

Este microserviço faz parte de uma arquitetura distribuída e sua principal responsabilidade é controlar o CRUD das financas.

A aplicação é construída com [NestJS](https://nestjs.com/) e utiliza [Knex.js](https://knexjs.org/) para comunicação com o banco de dados PostgreSQL.

## 🚀 Como Rodar (Localmente)

Siga os passos abaixo para configurar e executar o serviço em seu ambiente de desenvolvimento.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v20.x ou superior)
- [Yarn](https://yarnpkg.com/) (ou `npm`)
- [Docker](https://www.docker.com/products/docker-desktop/) (para rodar o banco de dados facilmente)

### 1. Clonar o Repositório

```bash
git clone https://github.com/Jonatas-Felipe/tinnova-backend-top-users.git
cd tinnova-backend-top-users
```

### 2. Instalar as Dependências

```bash
yarn install
```

### 3. Configurar o Ambiente

Crie uma cópia do arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

Agora, abra o arquivo `.env` e preencha as variáveis necessárias, principalmente as de conexão com o banco de dados (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, etc.).

### 4. Subir o Banco de Dados (Opcional, com Docker)

Se você tiver o Docker instalado, pode subir um container PostgreSQL para este serviço com o `docker-compose.yml` do repositório de infraestrutura.

### 5. Executar o Serviço

Para iniciar a aplicação em modo de desenvolvimento com hot-reload:

```bash
yarn start:dev
```

A API estará disponível em `http://localhost:[porta_definida_no_env]`.

---

## 🗃️ Banco de Dados (Knex.js)

As migrações do banco de dados são gerenciadas pelo Knex.js.

### Como Executar as Migrações

Para aplicar todas as migrações pendentes e deixar seu banco de dados atualizado, execute:

```bash
yarn knex:migrate
```

> **Nota:** Este comando geralmente corresponde a `npx knex migrate:latest`.

### Outros Comandos Úteis

- **Reverter a última migração:**
  ```bash
  yarn knex:migrate:rollback
  ```

- **Criar um novo arquivo de migração:**
  ```bash
  npx knex migrate:make nome-da-sua-migracao
  ```

---

## ✅ Testes (NestJS)

A suíte de testes é construída sobre o framework [Jest](https://jestjs.io/) dentro do [NestJS](https://nestjs.com/).

### Como Rodar os Testes

- **Para rodar todos os testes (unitários e e2e):**
  ```bash
  yarn test
  ```

- **Para rodar os testes em modo "watch" (observando alterações nos arquivos):**
  ```bash
  yarn test:watch
  ```

- **Para ver o relatório de cobertura de testes:**
  ```bash
  yarn test:cov
  ```