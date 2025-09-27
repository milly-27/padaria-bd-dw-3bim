// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPedidoId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('pedidoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pedidosTableBody = document.getElementById('pedidosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de pedidos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarPedido);
btnIncluir.addEventListener('click', incluirPedido);
btnAlterar.addEventListener('click', alterarPedido);
btnExcluir.addEventListener('click', excluirPedido);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);
bloquearCampos(false);

// Mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

// Bloquear/desbloquear campos
function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        input.disabled = index === 0 ? bloquearPrimeiro : !bloquearPrimeiro;
    });
}

// Limpar formulário
function limparFormulario() {
    form.reset();
    currentPedidoId = null;
}

// Mostrar/ocultar botões
function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Formatar data
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Buscar pedido
async function buscarPedido() {
    const id = Number(searchId.value.trim());

    if (!id || isNaN(id) || id <= 0) {
        mostrarMensagem('Digite um ID válido para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);

        if (response.ok) {
            const pedido = await response.json();
            preencherFormulario(pedido);
            currentPedidoId = pedido.id_pedido;
            mostrarBotoes(true, false, true, true, false, true);
            mostrarMensagem('Pedido encontrado!', 'success');
            bloquearCampos(true);
            searchId.disabled = false;
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, true);
            mostrarMensagem('Pedido não encontrado. Você pode incluir um novo pedido.', 'info');
            bloquearCampos(false);
            document.getElementById('cpf').focus();
        } else {
            throw new Error('Erro ao buscar pedido');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pedido', 'error');
    }
}

// Preencher formulário
function preencherFormulario(pedido) {
    document.getElementById('cpf').value = pedido.cpf || '';
    document.getElementById('data_pedido').value = pedido.data_pedido ? pedido.data_pedido.split('T')[0] : '';
    document.getElementById('valor_total').value = pedido.valor_total || '';
}

// Incluir pedido
async function incluirPedido() {
    mostrarMensagem('Digite os dados do novo pedido!', 'info');
    limparFormulario();
    const cpfFromSearch = searchId.value.trim();
    if (cpfFromSearch) document.getElementById('cpf').value = cpfFromSearch;
    searchId.value = '';
    bloquearCampos(true);
    searchId.disabled = true;
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('cpf').focus();
    operacao = 'incluir';
}

// Alterar pedido
async function alterarPedido() {
    if (!currentPedidoId) {
        mostrarMensagem('Selecione um pedido para alterar.', 'warning');
        return;
    }
    mostrarMensagem('Altere os dados do pedido!', 'info');
    bloquearCampos(true);
    searchId.disabled = true;
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('cpf').focus();
    operacao = 'alterar';
}

// Excluir pedido
async function excluirPedido() {
    if (!currentPedidoId) {
        mostrarMensagem('Selecione um pedido para excluir.', 'warning');
        return;
    }
    mostrarMensagem('Confirme a exclusão salvando...', 'warning');
    bloquearCampos(true);
    searchId.disabled = true;
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
}

// Salvar operação
async function salvarOperacao() {
    if (!operacao) {
        mostrarMensagem('Nenhuma operação selecionada!', 'warning');
        return;
    }

    const formData = new FormData(form);
    const pedido = {
        cpf: formData.get('cpf'),
        data_pedido: formData.get('data_pedido'),
        valor_total: parseFloat(formData.get('valor_total')) || 0,
        itens: []
    };

    if (!pedido.cpf || !pedido.data_pedido || isNaN(pedido.valor_total)) {
        mostrarMensagem('Preencha CPF, Data do Pedido e Valor Total.', 'error');
        return;
    }

    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });
        } else if (operacao === 'alterar') {
            if (!currentPedidoId || isNaN(currentPedidoId)) {
                mostrarMensagem('ID do pedido inválido para alteração.', 'error');
                return;
            }
            response = await fetch(`${API_BASE_URL}/pedidos/${currentPedidoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });
        } else if (operacao === 'excluir') {
            if (!currentPedidoId || isNaN(currentPedidoId)) {
                mostrarMensagem('ID do pedido inválido para exclusão.', 'error');
                return;
            }
            response = await fetch(`${API_BASE_URL}/pedidos/${currentPedidoId}`, {
                method: 'DELETE'
            });
        }

        if (response && response.ok) {
            mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
            limparFormulario();
            carregarPedidos();
        } else if (response) {
            const errorData = await response.json();
            mostrarMensagem(errorData.error || `Erro ao ${operacao} pedido.`, 'error');
        } else {
            mostrarMensagem(`Erro desconhecido ao ${operacao} pedido.`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem(`Erro ao ${operacao} pedido.`, 'error');
    }

    cancelarOperacao();
}

// Cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchId.disabled = false;
    searchId.focus();
    operacao = null;
    mostrarMensagem('Operação cancelada', 'info');
}

// Carregar lista de pedidos
async function carregarPedidos() {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`);
        if (response.ok) {
            const pedidos = await response.json();
            renderizarTabelaPedidos(pedidos);
        } else {
            throw new Error('Erro ao carregar pedidos');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pedidos', 'error');
    }
}

// Renderizar tabela
function renderizarTabelaPedidos(pedidos) {
    pedidosTableBody.innerHTML = '';
    pedidos.forEach(pedido => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarPedido(${pedido.id_pedido})">
                    ${pedido.id_pedido}
                </button>
            </td>
            <td>${pedido.cpf}</td>
            <td>${pedido.cliente || 'N/A'}</td>
            <td>${formatarData(pedido.data_pedido)}</td>
            <td>${parseFloat(pedido.valor_total).toFixed(2)}</td>                 
        `;
        pedidosTableBody.appendChild(row);
    });
}

// Selecionar pedido
async function selecionarPedido(id) {
    if (!id || isNaN(id)) {
        mostrarMensagem('ID inválido ao selecionar pedido.', 'error');
        return;
    }
    searchId.value = id;
    await buscarPedido();
}
