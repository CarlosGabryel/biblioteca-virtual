/**
 * Lógica de Gerenciamento de Livros com Busca Dinâmica
 */

const formLivro = document.getElementById('form-livro');
const tabelaLivrosBody = document.querySelector('#tabela-livros tbody');
const inputBusca = document.getElementById('input-busca');

let todosOsLivros = []; // Cache para busca dinâmica

// Função para carregar a lista do servidor
async function carregarListaLivros() {
    try {
        const res = await fetch('/api/livros');
        todosOsLivros = await res.json(); // Guarda os livros na variável global
        renderizarTabela(todosOsLivros); // Renderiza a lista completa inicialmente
    } catch (err) {
        console.error("Erro ao carregar lista de livros:", err);
    }
}

// Função para renderizar as linhas na tabela
function renderizarTabela(lista) {
    if (!tabelaLivrosBody) return;

    if (lista.length === 0) {
        tabelaAlunosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum livro encontrado.</td></tr>';
        return;
    }

    tabelaLivrosBody.innerHTML = lista.map(livro => `
        <tr>
            <td><strong>${livro.isbn}</strong></td>
            <td>${livro.nome_livro}</td>
            <td>${livro.autor}</td>
            <td>${livro.qtd_disponivel} un.</td>
            <td>
                <button onclick="prepararEdicao('${livro.isbn}', '${livro.nome_livro}', '${livro.autor}', ${livro.qtd_disponivel})">Editar</button>
            </td>
        </tr>
    `).join('');
}

// Evento de Busca Dinâmica (Filtro em tempo real)
inputBusca.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    
    // Filtra por nome do livro ou autor
    const livrosFiltrados = todosOsLivros.filter(livro => 
        livro.nome_livro.toLowerCase().includes(termo) || 
        livro.autor.toLowerCase().includes(termo) ||
        livro.isbn.toLowerCase().includes(termo)
    );
    
    renderizarTabela(livrosFiltrados);
});

// Preparar Edição (Global para o botão funcionar)
window.prepararEdicao = (isbn, nome, autor, qtd) => {
    document.getElementById('livro-isbn').value = isbn;
    document.getElementById('livro-isbn').disabled = true;
    document.getElementById('livro-nome').value = nome;
    document.getElementById('livro-autor').value = autor;
    document.getElementById('livro-qtd').value = qtd;
    
    const btn = document.querySelector('#form-livro button');
    btn.innerText = "Salvar Alterações";
    formLivro.dataset.mode = 'edit';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cadastro/Edição onsubmit (O código que já tínhamos)
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

document.addEventListener('DOMContentLoaded', carregarListaLivros);