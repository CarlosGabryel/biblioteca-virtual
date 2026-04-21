/**
 * Lógica de Empréstimos e Devoluções
 * Gerencia os selects dinâmicos e o histórico persistente
 */

const selectLivro = document.getElementById('select-livro');
const selectAluno = document.getElementById('select-aluno');
const formEmprestimo = document.getElementById('form-emprestimo');
const tabelaEmprestimosBody = document.querySelector('#tabela-emprestimos tbody');

// 1. Carregar Livros para o Select
async function carregarLivrosSelect() {
    const res = await fetch('/api/livros');
    const livros = await res.json();
    const disponiveis = livros.filter(l => l.qtd_disponivel > 0);
    
    selectLivro.innerHTML = disponiveis.map(l => 
        `<option value="${l.isbn}">${l.nome_livro} (${l.qtd_disponivel} disp.)</option>`
    ).join('') || '<option value="">Nenhum livro disponível</option>';
}

// 2. Carregar Alunos para o Select
async function carregarAlunosSelect() {
    const res = await fetch('/api/alunos');
    const alunos = await res.json();
    
    selectAluno.innerHTML = alunos.map(a => 
        `<option value="${a.id}">${a.nome}</option>`
    ).join('') || '<option value="">Cadastre um aluno primeiro</option>';
}

// 3. Carregar Histórico de Empréstimos na Tabela
async function carregarHistorico() {
    try {
        const res = await fetch('/api/emprestimos');
        const dados = await res.json();

        if (dados.length === 0) {
            tabelaEmprestimosBody.innerHTML = '<tr><td colspan="5">Nenhum registro encontrado.</td></tr>';
            return;
        }

        tabelaEmprestimosBody.innerHTML = dados.map(e => {
            const dtEmprestimo = new Date(e.data_emprestimo).toLocaleDateString('pt-BR');
            const dtDevolucao = e.data_devolucao 
                ? new Date(e.data_devolucao).toLocaleDateString('pt-BR') 
                : '---';
            
            // Se já foi devolvido, mostra selo. Se não, mostra botão.
            const acao = e.data_devolucao 
                ? '<span class="status-ok">Devolvido</span>' 
                : `<button class="btn-devolver" onclick="registrarDevolucao(${e.id})">Devolver</button>`;

            return `
                <tr>
                    <td>${e.nome_livro}</td>
                    <td>${e.nome_aluno}</td>
                    <td>${dtEmprestimo}</td>
                    <td>${dtDevolucao}</td>
                    <td>${acao}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Erro ao carregar histórico:", err);
    }
}

// 4. Registrar Novo Empréstimo
formEmprestimo.onsubmit = async (e) => {
    e.preventDefault();
    
    const confirmacao = prompt("Para confirmar o empréstimo, digite: confirmar");
    
    if (confirmacao !== "confirmar") {
        alert("Operação cancelada ou senha incorreta.");
        return;
    }

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
        alert('Empréstimo realizado!');
        formEmprestimo.reset();
        await atualizarTudo();
    } else {
        const erro = await res.json();
        alert('Erro: ' + erro.error);
    }
};

// 5. Registrar Devolução
window.registrarDevolucao = async (id) => {
    if (!confirm('Confirmar devolução deste exemplar?')) return;

    const res = await fetch(`/api/emprestimos/${id}/devolucao`, {
        method: 'PUT'
    });

    if (res.ok) {
        await atualizarTudo();
    } else {
        alert('Erro ao processar devolução.');
    }
};

// Função auxiliar para recarregar os dados da tela
async function atualizarTudo() {
    await carregarLivrosSelect();
    await carregarAlunosSelect();
    await carregarHistorico();
}

// Inicialização
document.addEventListener('DOMContentLoaded', atualizarTudo);