require('dotenv').config(); // Carrega as variáveis do .env
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Teste de conexão opcional para o log
pool.on('connect', () => {
    console.log('Pool de conexão estabelecido com o Postgres.');
});

module.exports = pool;