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
                <td><button onclick="prepararEdicao('${aluno.id}', '${aluno.nome}', '${aluno.turma}')">Editar</button></td>

            </tr>
        `).join('');

        window.prepararEdicao = (id, nome, turma) => {
            document.getElementById('aluno-id').value = id;
            document.getElementById('aluno-nome').value = nome;
            document.getElementById('aluno-turma').value = turma;

            // Muda o comportamento do botão para "Salvar Alterações"
            const btn = document.querySelector('#form-aluno button');
            btn.innerText = "Salvar Alterações";
            formAluno.dataset.mode = 'edit';

            // Para rolar a tela automaticamente para o formulário de edição
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

    } catch (err) {
        console.error("Erro ao carregar lista de alunos:", err);
    }
}

// 2. Evento de submissão do formulário de cadastro
if (formAluno) {
    formAluno.onsubmit = async (e) => {
        e.preventDefault();

        const mode = formAluno.dataset.mode;
        const id = document.getElementById('aluno-id').value; // Pega do campo hidden

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

                // Limpeza total após sucesso
                formAluno.reset();
                document.getElementById('aluno-id').value = ''; // Limpa o ID hidden
                document.querySelector('#form-aluno button').innerText = "Finalizar Cadastro";
                formAluno.dataset.mode = 'create';

                carregarListaAlunos();
            } else {
                const errorData = await res.json();
                alert('Erro: ' + errorData.error);
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
        }
    };
}

// 3. Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarListaAlunos();
});