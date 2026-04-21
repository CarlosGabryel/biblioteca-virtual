const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rota: Listar Livros
router.get('/livros', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Livro WHERE qtd_disponivel > 0');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});

// Rota: Cadastrar Livro
router.post('/livros', async (req, res) => {
    const { nome_livro, isbn, autor, qtd_disponivel } = req.body;
    try {
        await pool.query(
            'INSERT INTO Livro (isbn, nome_livro, autor, qtd_disponivel) VALUES ($1, $2, $3, $4)',
            [isbn, nome_livro, autor, qtd_disponivel]
        );
        res.status(201).json({ message: 'Livro cadastrado!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Rota: Registrar Empréstimo (Lógica de Transação)
router.post('/emprestimos', async (req, res) => {
    const { isbn, aluno_id, nome_bibliotecario } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updateRes = await client.query(
            'UPDATE Livro SET qtd_disponivel = qtd_disponivel - 1 WHERE isbn = $1 AND qtd_disponivel > 0 RETURNING *',
            [isbn]
        );
        if (updateRes.rowCount === 0) throw new Error('Livro esgotado.');

        await client.query(
            'INSERT INTO Emprestimo (isbn, aluno_id, nome_bibliotecario) VALUES ($1, $2, $3)',
            [isbn, aluno_id, nome_bibliotecario]
        );
        await client.query('COMMIT');
        res.status(201).json({ message: 'Empréstimo realizado!' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Rota: Cadastrar Aluno
router.post('/alunos', async (req, res) => {
    const { nome, turma } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO Aluno (nome, turma) VALUES ($1, $2) RETURNING id',
            [nome, turma]
        );
        res.status(201).json({ message: 'Aluno cadastrado!', id: result.rows[0].id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Rota: Listar Empréstimos Ativos e histórico de empréstimos
router.get('/emprestimos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.id, l.nome_livro, a.nome as nome_aluno, 
                   e.data_emprestimo, e.data_devolucao, e.nome_bibliotecario
            FROM Emprestimo e 
            JOIN Livro l ON e.isbn = l.isbn 
            JOIN Aluno a ON e.aluno_id = a.id
            ORDER BY e.data_emprestimo DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota: Registrar Devolução (Aumenta o estoque e marca a data)
router.put('/emprestimos/:id/devolucao', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Marcar data de devolução e pegar o ISBN
        const empRes = await client.query(
            'UPDATE Emprestimo SET data_devolucao = CURRENT_DATE WHERE id = $1 RETURNING isbn',
            [id]
        );
        
        // 2. Incrementar estoque do livro
        const isbn = empRes.rows[0].isbn;
        await client.query(
            'UPDATE Livro SET qtd_disponivel = qtd_disponivel + 1 WHERE isbn = $1',
            [isbn]
        );

        await client.query('COMMIT');
        res.json({ message: 'Livro devolvido com sucesso!' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Rota: Listar todos os alunos (para o select)
router.get('/alunos', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome FROM Aluno ORDER BY nome ASC');
        res.json(result.rows); // Isso deve retornar um array de objetos
    } catch (err) {
        console.error("Erro na rota GET /alunos:", err);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

// Rota: Editar Livro (Atualizar dados)
router.put('/livros/:isbn', async (req, res) => {
    const { isbn } = req.params;
    const { nome_livro, autor, qtd_disponivel } = req.body;
    try {
        const result = await pool.query(
            'UPDATE Livro SET nome_livro = $1, autor = $2, qtd_disponivel = $3 WHERE isbn = $4 RETURNING *',
            [nome_livro, autor, qtd_disponivel, isbn]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Livro não encontrado." });
        }
        
        res.json({ message: 'Livro atualizado com sucesso!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;