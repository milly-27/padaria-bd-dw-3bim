// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentIdPedido = null;
let currentIdProduto = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('pedidoProdutoForm');
const searchIdPedido = document.getElementById('id_pedido');
const searchIdProduto = document.getElementById('id_produto');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pedidoProdutoTableBody = document.getElementById('pedidoProdutoTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista inicial
document.addEventListener('DOMContentLoaded', () => {
    carregarLista();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarRegistro);
btnIncluir.addEventListener('click', incluirRegistro);
btnAlterar.addEventListener('click', alterarRegistro);
btnExcluir.addEventListener('click', excluirRegistro);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);
bloquearCampos(false);

// -------- Utilitários --------
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
}

function bloquearCampos(bloquearIds) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach((input, index) => {
        if (index < 2) {
            // os 2 primeiros são ids
            input.disabled = bloquearIds;
        } else {
            input.disabled = !bloquearIds;
        }
    });
}

function limparFormulario() {
    form.reset();
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// -------- CRUD --------

// Buscar por IDs
async function buscarRegistro() {
    const idPedido = searchIdPedido.value.trim();
    const idProduto = searchIdProduto.value.trim();

    if (!idPedido || !idProduto) {
        mostrarMensagem('Digite ID Pedido e ID Produto para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/pedidoProduto/${idPedido}/${idProduto}`);

        if (response.ok) {
            const registro = await response.json();
            preencherFormulario(registro);
            mostrarBotoes(true, false, true, true, false, false);
            mostrarMensagem('Registro encontrado!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchIdPedido.value = idPedido;
            searchIdProduto.value = idProduto;
            mostrarBotoes(true, true, false, false, false, false);
            mostrarMensagem('Registro não encontrado. Você pode incluir um novo.', 'info');
            bloquearCampos(true);
        } else {
            throw new Error('Erro ao buscar registro');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar registro', 'error');
    }
}

function preencherFormulario(registro) {
    currentIdPedido = registro.id_pedido;
    currentIdProduto = registro.id_produto;

    document.getElementById('id_pedido').value = registro.id_pedido;
    document.getElementById('id_produto').value = registro.id_produto;
    document.getElementById('quantidade').value = registro.quantidade;
    document.getElementById('preco_unitario').value = registro.preco_unitario;
}

function incluirRegistro() {
    mostrarMensagem('Digite os dados!', 'success');
    currentIdPedido = searchIdPedido.value;
    currentIdProduto = searchIdProduto.value;
    limparFormulario();
    searchIdPedido.value = currentIdPedido;
    searchIdProduto.value = currentIdProduto;
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('quantidade').focus();
    operacao = 'incluir';
}

function alterarRegistro() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('quantidade').focus();
    operacao = 'alterar';
}

function excluirRegistro() {
    mostrarMensagem('Excluindo registro...', 'info');
    currentIdPedido = searchIdPedido.value;
    currentIdProduto = searchIdProduto.value;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
}

async function salvarOperacao() {
    const formData = new FormData(form);
    const registro = {
        id_pedido: searchIdPedido.value,
        id_produto: searchIdProduto.value,
        quantidade: formData.get('quantidade'),
        preco_unitario: formData.get('preco_unitario')
    };

    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pedidoProduto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registro)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/pedidoProduto/${currentIdPedido}/${currentIdProduto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registro)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/pedidoProduto/${currentIdPedido}/${currentIdProduto}`, {
                method: 'DELETE'
            });
        }

        if (response && response.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            mostrarMensagem('Operação realizada com sucesso!', 'success');
            limparFormulario();
            carregarLista();
        } else if (operacao === 'excluir' && response.ok) {
            mostrarMensagem('Registro excluído com sucesso!', 'success');
            limparFormulario();
            carregarLista();
        } else if (response && !response.ok) {
            const error = await response.json();
            mostrarMensagem(error.error || 'Erro na operação', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao salvar operação', 'error');
    }

    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchIdPedido.focus();
}

function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchIdPedido.focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// -------- Lista --------
async function carregarLista() {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidoProduto`);
        if (response.ok) {
            const lista = await response.json();
            renderizarTabela(lista);
        } else {
            throw new Error('Erro ao carregar lista');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista', 'error');
    }
}

function renderizarTabela(lista) {
    pedidoProdutoTableBody.innerHTML = '';

    lista.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarRegistro(${item.id_pedido}, ${item.id_produto})">
                    Pedido: ${item.id_pedido} / Produto: ${item.id_produto}
                </button>
            </td>
            <td>${item.quantidade}</td>
            <td>${item.preco_unitario}</td>
        `;
        pedidoProdutoTableBody.appendChild(row);
    });
}

// Selecionar item da tabela
async function selecionarRegistro(idPedido, idProduto) {
    searchIdPedido.value = idPedido;
    searchIdProduto.value = idProduto;
    await buscarRegistro();
}
