/**
 * Lógica de Gerenciamento de Livros
 * Responsável por: Listar e Cadastrar livros no acervo
 */

const formLivro = document.getElementById('form-livro');
const tabelaLivrosBody = document.querySelector('#tabela-livros tbody');

// 1. Função para carregar a lista de livros do servidor
async function carregarListaLivros() {
    try {
        const res = await fetch('/api/livros');
        const livros = await res.json();

        if (!tabelaLivrosBody) return;

        if (livros.length === 0) {
            tabelaLivrosBody.innerHTML = '<tr><td colspan="4">Nenhum livro no acervo.</td></tr>';
            return;
        }

        // Popula a tabela com as informações do livro
        tabelaLivrosBody.innerHTML = livros.map(livro => `
    <tr>
        <td><strong>${livro.isbn}</strong></td>
        <td>${livro.nome_livro}</td>
        <td>${livro.autor}</td>
        <td>${livro.qtd_disponivel}</td>
        <td><button onclick="prepararEdicao('${livro.isbn}', '${livro.nome_livro}', '${livro.autor}', ${livro.qtd_disponivel})">Editar</button></td>
    </tr>
`).join('');

        window.prepararEdicao = (isbn, nome, autor, qtd) => {
            document.getElementById('livro-isbn').value = isbn;
            document.getElementById('livro-isbn').disabled = true; // ISBN não deve ser alterado
            document.getElementById('livro-nome').value = nome;
            document.getElementById('livro-autor').value = autor;
            document.getElementById('livro-qtd').value = qtd;

            // Muda o comportamento do botão para "Salvar Alterações"
            const btn = document.querySelector('#form-livro button');
            btn.innerText = "Salvar Alterações";
            formLivro.dataset.mode = 'edit';
        };

    } catch (err) {
        console.error("Erro ao carregar lista de livros:", err);
    }
}

// 2. Evento de submissão do formulário de cadastro
if (formLivro) {
    formLivro.onsubmit = async (e) => {
        e.preventDefault();
        const mode = formLivro.dataset.mode;
        const isbn = document.getElementById('livro-isbn').value;

        const dados = {
            nome_livro: document.getElementById('livro-nome').value,
            autor: document.getElementById('livro-autor').value,
            qtd_disponivel: parseInt(document.getElementById('livro-qtd').value)
        };

        const url = mode === 'edit' ? `/api/livros/${isbn}` : '/api/livros';
        const method = mode === 'edit' ? 'PUT' : 'POST';

        // Adiciona o isbn no corpo apenas se for cadastro novo
        if (mode !== 'edit') dados.isbn = isbn;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            alert(mode === 'edit' ? 'Livro atualizado!' : 'Livro cadastrado!');
            formLivro.reset();
            document.getElementById('livro-isbn').disabled = false;
            document.querySelector('#form-livro button').innerText = "Cadastrar no Acervo";
            formLivro.dataset.mode = 'create';
            carregarListaLivros();
        }
    };
}

// 3. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarListaLivros();
});