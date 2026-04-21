/**
 * Ponto de entrada da aplicação - Biblioteca Virtual
 * Responsável por configurar o Express, middlewares e rotas.
 */

require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(express.json()); // Permite receber JSON no corpo das requisições

// Servir arquivos estáticos da pasta 'public'
// Isso permite que o navegador acesse o CSS e os JS das páginas
app.use(express.static(path.join(__dirname, 'public')));

// Definição das Rotas da API
// Todas as rotas criadas no arquivo routes/api.js terão o prefixo /api
app.use('/api', apiRoutes);

// Roteamento manual para as páginas HTML (Opcional, mas melhora a experiência)
// Isso permite acessar http://localhost:3000/alunos em vez de alunos.html
app.get('/alunos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'alunos.html'));
});

app.get('/livros', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'livros.html'));
});

// Porta de execução (usa a do .env ou a 3000 como fallback)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
==================================================
   SISTEMA DE BIBLIOTECA VIRTUAL INICIADO
==================================================
> Servidor rodando em: http://localhost:${PORT}
> Banco de Dados: ${process.env.DB_NAME}
> Status: Online e aguardando conexões...
==================================================
    `);
});