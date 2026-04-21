-- Criar tabelas
CREATE TABLE Livro (
    isbn VARCHAR(20) PRIMARY KEY,
    nome_livro VARCHAR(255) NOT NULL,
    qtd_disponivel INTEGER NOT NULL DEFAULT 0 CHECK (qtd_disponivel >= 0),
    autor VARCHAR(255) NOT NULL
);

CREATE TABLE Aluno (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    turma VARCHAR(50) NOT NULL
);

CREATE TABLE Emprestimo (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(20) REFERENCES Livro(isbn),
    aluno_id INTEGER REFERENCES Aluno(id),
    data_emprestimo DATE DEFAULT CURRENT_DATE,
    nome_bibliotecario VARCHAR(255) NOT NULL
);