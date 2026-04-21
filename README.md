# Sistema de Biblioteca Virtual Modularizado

Este projeto é um sistema de gestão de biblioteca desenvolvido para melhor organização da Biblioteca. A aplicação foca em uma arquitetura limpa, modularizada e segura, utilizando o stack Node.js com PostgreSQL.

## Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (Variáveis e Flexbox) e JavaScript (ES6+).
* **Back-end:** Node.js com Express.
* **Banco de Dados:** PostgreSQL (Driver `pg`).
* **Segurança:** Variáveis de ambiente com `dotenv` e controle de transações SQL (ACID).

## Estrutura do Projeto

A organização segue o princípio de **Separação de Preocupações (SoC)**:

```text
biblioteca-virtual/
├── config/
│   └── database.js         # Configuração da conexão com o Pool do Postgres
├── db/
│   └── schema.sql          # Script DDL para criação das tabelas
├── public/                 # Arquivos estáticos (Interface)
│   ├── css/
│   │   └── style.css       # Estilização global e responsiva
│   ├── js/
│   │   ├── alunos.js       # Lógica de cadastro e listagem de alunos
│   │   ├── livros.js       # Lógica de cadastro, listagem e edição de livros
│   │   └── emprestimos.js  # Gestão de empréstimos, histórico e segurança
│   ├── alunos.html         # Gestão de Alunos
│   ├── livros.html         # Gestão de Acervo
│   └── index.html          # Dashboard de Empréstimos e Devoluções
├── routes/
│   └── api.js              # Definição das rotas REST da aplicação
├── .env                    # Variáveis sensíveis (Credenciais de banco)
├── server.js               # Ponto de entrada (Entry point) da aplicação
└── package.json            # Manifesto e dependências do projeto
```
## Funcionalidades Principais
1. Gestão de Alunos: Cadastro e visualização de estudantes.

2. Gestão de Acervo: Cadastro de livros com controle de estoque e função de Edição.

3. Empréstimos com Segurança: * Trava de segurança via senha ("confirmar") para evitar registros acidentais.
    - Seleção dinâmica de livros e alunos via interface.

4. Histórico e Devoluções: * Lógica de devolução que incrementa automaticamente o estoque do livro.
    - Histórico persistente que mantém o registro mesmo após a entrega.

5. Controle de Transações: O backend garante que um empréstimo só seja registrado se o estoque for decrementado com sucesso, evitando inconsistências.

## Como Rodar o Projeto
1. Pré-requisitos
> Node.js instalado.
> PostgreSQL rodando localmente.

2. Configuração do Banco de Dados
    - Crie um banco chamado biblioteca_db e execute o script em db/schema.sql.

3. Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto com as seguintes chaves:
```bash
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biblioteca_db
PORT=3000
```

4. Instalação e Execução
```bash
# Instalar dependências
npm install

# Iniciar o servidor
node server.js
```

## Detalhes Técnicos
> Arquitetura REST: As rotas são separadas por recursos (/api/livros, /api/alunos, /api/emprestimos).

> Integridade de Dados: O sistema utiliza BEGIN, COMMIT e ROLLBACK nas rotas críticas para garantir que falhas no servidor não corrompam os dados de estoque.

> Modularização Front-end: Cada página possui seu próprio arquivo JavaScript, facilitando a depuração e expansão do sistema.