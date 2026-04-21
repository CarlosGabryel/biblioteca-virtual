/**
 * Lógica de Gerenciamento de Alunos
 * Responsável por: Listar e Cadastrar alunos
 */
const formAluno = document.getElementById('form-aluno');
const tabelaAlunosBody = document.querySelector('#tabela-alunos tbody');

// 1. Função para carregar a lista de alunos do servidor
async function carregarListaAlunos() {
    try {
        const res = await fetch('/api/alunos');
        const alunos = await res.json();

        // Se a tabela não existir na página (ex: se você usar o script em outro lugar), evita erro
        if (!tabelaAlunosBody) return;

        if (alunos.length === 0) {
            tabelaAlunosBody.innerHTML = '<tr><td colspan="3">Nenhum aluno cadastrado.</td></tr>';
            return;
        }

        // Popula a tabela com ID, Nome e Turma
        tabelaAlunosBody.innerHTML = alunos.map(aluno => `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.turma || 'N/A'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar lista de alunos:", err);
    }
}

// 2. Evento de submissão do formulário de cadastro
if (formAluno) {
    formAluno.onsubmit = async (e) => {
        e.preventDefault();

        const dados = {
            nome: document.getElementById('aluno-nome').value,
            turma: document.getElementById('aluno-turma').value
        };

        try {
            const res = await fetch('/api/alunos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const result = await res.json();

            if (res.ok) {
                alert(`Aluno cadastrado com sucesso! ID: ${result.id}`);
                formAluno.reset();
                carregarListaAlunos(); // Atualiza a tabela imediatamente
            } else {
                alert('Erro ao cadastrar: ' + result.error);
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Erro ao conectar com o servidor.");
        }
    };
}

// 3. Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarListaAlunos();
});