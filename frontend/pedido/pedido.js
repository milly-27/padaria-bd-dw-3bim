
// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPedidoId = null; // Alterado de currentPersonId para currentPedidoId
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

mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
bloquearCampos(false);//libera pk e bloqueia os demais campos

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            // Primeiro elemento (searchId) - bloqueia se bloquearPrimeiro for true, libera se for false
            input.disabled = bloquearPrimeiro;
        } else {
            // Demais elementos - faz o oposto do primeiro
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    currentPedidoId = null; // Limpa o ID do pedido atual
}


function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para converter data para formato ISO (não usada diretamente no formulário, mas útil para o backend)
function converterDataParaISO(dataString) {
    if (!dataString) return null;
    return new Date(dataString).toISOString();
}

// Função para buscar pedido por ID
async function buscarPedido() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);

        if (response.ok) {
            const pedido = await response.json();
            preencherFormulario(pedido);
            currentPedidoId = pedido.id_pedido; // Armazena o ID do pedido encontrado
            mostrarBotoes(true, false, true, true, false, true); // btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar
            mostrarMensagem('Pedido encontrado!', 'success');
            bloquearCampos(true); // Bloqueia todos os campos para visualização
            searchId.disabled = false; // Mantém o campo de busca habilitado

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id; // Mantém o ID digitado no campo de busca
            mostrarBotoes(true, true, false, false, false, true); // btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar
            mostrarMensagem('Pedido não encontrado. Você pode incluir um novo pedido.', 'info');
            bloquearCampos(false); // Libera o campo de busca e bloqueia os demais
            document.getElementById('cpf').focus(); // Foca no campo CPF para inclusão
        } else {
            throw new Error('Erro ao buscar pedido');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pedido', 'error');
    }
}

// Função para preencher formulário com dados da pedido
function preencherFormulario(pedido) {
    document.getElementById('cpf').value = pedido.cpf || '';
    document.getElementById('data_pedido').value = pedido.data_pedido ? pedido.data_pedido.split('T')[0] : '';
    document.getElementById('valor_total').value = pedido.valor_total || '';
}


// Função para incluir pedido
async function incluirPedido() {
    mostrarMensagem('Digite os dados do novo pedido!', 'info');
    limparFormulario();
    // Se houver um ID no campo de busca, ele pode ser o CPF para o novo pedido
    const cpfFromSearch = searchId.value.trim();
    if (cpfFromSearch) {
        document.getElementById('cpf').value = cpfFromSearch;
    }
    searchId.value = ''; // Limpa o campo de busca para nova inclusão
    bloquearCampos(true); // Bloqueia o campo de busca e libera os demais
    searchId.disabled = true; // Garante que o campo de busca esteja desabilitado
    mostrarBotoes(false, false, false, false, true, true); // btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar
    document.getElementById('cpf').focus();
    operacao = 'incluir';
}

// Função para alterar pedido
async function alterarPedido() {
    if (!currentPedidoId) {
        mostrarMensagem('Selecione um pedido para alterar.', 'warning');
        return;
    }
    mostrarMensagem('Altere os dados do pedido!', 'info');
    bloquearCampos(true); // Bloqueia o campo de busca e libera os demais
    searchId.disabled = true; // Garante que o campo de busca esteja desabilitado
    mostrarBotoes(false, false, false, false, true, true); // btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar
    document.getElementById('cpf').focus();
    operacao = 'alterar';
}

// Função para excluir pedido
async function excluirPedido() {
    if (!currentPedidoId) {
        mostrarMensagem('Selecione um pedido para excluir.', 'warning');
        return;
    }
    mostrarMensagem('Confirme a exclusão salvando...', 'warning');
    bloquearCampos(true); // Bloqueia todos os campos, exceto o de busca
    searchId.disabled = true; // Garante que o campo de busca esteja desabilitado
    mostrarBotoes(false, false, false, false, true, true); // btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar
    operacao = 'excluir';
}

async function salvarOperacao() {
    if (!operacao) {
        mostrarMensagem('Nenhuma operação selecionada!', 'warning');
        return;
    }

    const formData = new FormData(form);
    const pedido = {
        cpf: formData.get('cpf'),
        data_pedido: formData.get('data_pedido'),
        valor_total: parseFloat(formData.get('valor_total')) || 0, // Garante que é um número
        itens: [] // Assumindo que itens serão gerenciados separadamente ou não são parte deste formulário simples
    };

    // Validação básica dos campos
    if (!pedido.cpf || !pedido.data_pedido || isNaN(pedido.valor_total)) {
        mostrarMensagem('Preencha todos os campos obrigatórios (CPF, Data do Pedido, Valor Total).', 'error');
        return;
    }

    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
        } else if (operacao === 'alterar') {
            if (!currentPedidoId) {
                mostrarMensagem('ID do pedido não encontrado para alteração.', 'error');
                return;
            }
            response = await fetch(`${API_BASE_URL}/pedidos/${currentPedidoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
        } else if (operacao === 'excluir') {
            if (!currentPedidoId) {
                mostrarMensagem('ID do pedido não encontrado para exclusão.', 'error');
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

    cancelarOperacao(); // Reseta o estado da interface após salvar
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false); // btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar
    bloquearCampos(false); // Libera o campo de busca e bloqueia os demais
    searchId.disabled = false; // Garante que o campo de busca esteja habilitado
    searchId.focus();
    operacao = null; // Reseta a operação
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de pedidos
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

// Função para renderizar tabela de pedidos
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
                    <td>${pedido.cliente || 'N/A'}</td> <!-- Exibe o nome do cliente -->
                    <td>${formatarData(pedido.data_pedido)}</td>
                    <td>${parseFloat(pedido.valor_total).toFixed(2)}</td>                 
                `;
        pedidosTableBody.appendChild(row);
    });
}

// Função para selecionar pedido da tabela
async function selecionarPedido(id) {
    searchId.value = id;
    await buscarPedido();
}


