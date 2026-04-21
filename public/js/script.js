const selectLivro = document.getElementById('select-livro');
const selectAluno = document.getElementById('select-aluno');

// Função para listar livros no Select
async function carregarLivros() {
    const res = await fetch('/api/livros');
    const livros = await res.json();
    selectLivro.innerHTML = livros.map(l => 
        `<option value="${l.isbn}">${l.nome_livro} (${l.qtd_disponivel} un.)</option>`
    ).join('');
}

// Função para carregar alunos no Select
async function carregarAlunos() {
    const res = await fetch('/api/alunos');
    const alunos = await res.json();
    if (alunos.length === 0) {
        selectAluno.innerHTML = '<option value="">Cadastre um aluno primeiro</option>';
        return;
    }
    selectAluno.innerHTML = alunos.map(a => 
        `<option value="${a.id}">${a.nome}</option>`
    ).join('');
}

// Evento: Cadastrar Livro
document.getElementById('form-aluno').onsubmit = async (e) => {
    e.preventDefault();
    const dados = {
        nome: document.getElementById('aluno-nome').value,
        turma: document.getElementById('aluno-turma').value
    };
    const res = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    if (res.ok) {
        alert('Aluno cadastrado com sucesso!');
        e.target.reset();
        carregarAlunos(); // Atualiza a lista de alunos no select de empréstimo
    }
};

// Evento: Realizar Empréstimo
document.getElementById('form-emprestimo').onsubmit = async (e) => {
    e.preventDefault();
    
    // Pegamos os IDs diretamente dos Selects
    const payload = {
        isbn: selectLivro.value,
        aluno_id: selectAluno.value,
        nome_bibliotecario: document.getElementById('bibliotecario').value
    };

    const res = await fetch('/api/emprestimos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Empréstimo registrado!');
        e.target.reset();
        carregarLivros();
        carregarEmprestimos(); // Função da tabela de devolução
    } else {
        const err = await res.json();
        alert('Erro: ' + err.error);
    }
};

// Listar e Devolver
async function carregarEmprestimos() {
    const res = await fetch('/api/emprestimos');
    const dados = await res.json();
    const tbody = document.querySelector('#tabela-emprestimos tbody');
    tbody.innerHTML = dados.map(e => `
        <tr>
            <td>${e.nome_livro}</td>
            <td>${e.aluno_id}</td>
            <td>${new Date(e.data_emprestimo).toLocaleDateString()}</td>
            <td><button onclick="devolver(${e.id})">Devolver</button></td>
        </tr>
    `).join('');
}

async function devolver(id) {
    const res = await fetch(`/api/emprestimos/${id}/devolucao`, { method: 'PUT' });
    if (res.ok) {
        alert('Devolvido!');
        carregarEmprestimos();
        carregarLivros(); // Atualiza o select
    }
}

// Chame carregarEmprestimos() na inicialização
carregarEmprestimos();

carregarAlunos();

// Inicialização
carregarLivros();