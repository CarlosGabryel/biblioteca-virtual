/**
 * Lógica de Gerenciamento de Alunos com Busca Dinâmica
 */

const formAluno = document.getElementById('form-aluno');
const tabelaAlunosBody = document.querySelector('#tabela-alunos tbody');
const inputBusca = document.getElementById('input-busca-aluno');

let todosOsAlunos = []; // Cache para busca dinâmica em memória

// 1. Função para carregar a lista do servidor
async function carregarListaAlunos() {
    try {
        const res = await fetch('/api/alunos');
        todosOsAlunos = await res.json(); 
        renderizarTabelaAlunos(todosOsAlunos); // Mostra tudo inicialmente
    } catch (err) {
        console.error("Erro ao carregar lista de alunos:", err);
    }
}

// 2. Função para desenhar as linhas na tabela
function renderizarTabelaAlunos(lista) {
    if (!tabelaAlunosBody) return;

    if (lista.length === 0) {
        tabelaAlunosBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum aluno encontrado.</td></tr>';
        return;
    }

    tabelaAlunosBody.innerHTML = lista.map(aluno => `
        <tr>
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.turma || 'N/A'}</td>
            <td>
                <button onclick="prepararEdicao('${aluno.id}', '${aluno.nome}', '${aluno.turma}')">Editar</button>
            </td>
        </tr>
    `).join('');
}

// 3. Evento de Busca Dinâmica (Filtro instantâneo)
inputBusca.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    
    // Filtra por nome, turma ou ID
    const filtrados = todosOsAlunos.filter(aluno => 
        aluno.nome.toLowerCase().includes(termo) || 
        (aluno.turma && aluno.turma.toLowerCase().includes(termo)) ||
        aluno.id.toString().includes(termo)
    );
    
    renderizarTabelaAlunos(filtrados);
});

// 4. Preparar Edição (Global)
window.prepararEdicao = (id, nome, turma) => {
    document.getElementById('aluno-id').value = id; 
    document.getElementById('aluno-nome').value = nome;
    document.getElementById('aluno-turma').value = turma;

    const btn = document.querySelector('#form-aluno button');
    btn.innerText = "Salvar Alterações";
    formAluno.dataset.mode = 'edit';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 5. Cadastro/Edição onsubmit
if (formAluno) {
    formAluno.onsubmit = async (e) => {
        e.preventDefault();

        const mode = formAluno.dataset.mode;
        const id = document.getElementById('aluno-id').value;

        const dados = {
            nome: document.getElementById('aluno-nome').value,
            turma: document.getElementById('aluno-turma').value
        };

        const url = mode === 'edit' ? `/api/alunos/${id}` : '/api/alunos';
        const method = mode === 'edit' ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (res.ok) {
                alert(mode === 'edit' ? "Aluno atualizado!" : "Aluno cadastrado!");
                formAluno.reset();
                document.getElementById('aluno-id').value = '';
                document.querySelector('#form-aluno button').innerText = "Finalizar Cadastro";
                formAluno.dataset.mode = 'create';
                carregarListaAlunos(); // Atualiza cache e tabela
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
        }
    };
}

document.addEventListener('DOMContentLoaded', carregarListaAlunos);