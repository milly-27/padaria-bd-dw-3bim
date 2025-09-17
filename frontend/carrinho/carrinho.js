// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const carrinhoVazio = document.getElementById('carrinhoVazio');
const carrinhoConteudo = document.getElementById('carrinhoConteudo');
const itensCarrinho = document.getElementById('itensCarrinho');
const subtotalElement = document.getElementById('subtotal');
const taxaEntregaElement = document.getElementById('taxaEntrega');
const totalElement = document.getElementById('total');
const messageContainer = document.getElementById('messageContainer');
const btnLimparCarrinho = document.getElementById('btnLimparCarrinho');
const btnFinalizarPedido = document.getElementById('btnFinalizarPedido');
const enderecoInput = document.getElementById('endereco');
const observacoesInput = document.getElementById('observacoes');

// Modal
const modalConfirmacao = document.getElementById('modalConfirmacao');
const modalTotal = document.getElementById('modalTotal');
const modalEndereco = document.getElementById('modalEndereco');
const btnCancelarModal = document.getElementById('btnCancelarModal');
const btnConfirmarPedido = document.getElementById('btnConfirmarPedido');

// Variáveis globais
let carrinho = [];
const TAXA_ENTREGA = 5.00;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    atualizarInterface();
});

// Event Listeners
btnLimparCarrinho.addEventListener('click', limparCarrinho);
btnFinalizarPedido.addEventListener('click', abrirModalConfirmacao);
btnCancelarModal.addEventListener('click', fecharModal);
btnConfirmarPedido.addEventListener('click', finalizarPedido);

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 4000);
}

// Função para carregar carrinho do localStorage
function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
        try {
            carrinho = JSON.parse(carrinhoSalvo);
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            carrinho = [];
        }
    }
}

// Função para salvar carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Função para adicionar item ao carrinho (será chamada de outras páginas)
function adicionarAoCarrinho(produto, quantidade = 1) {
    const itemExistente = carrinho.find(item => item.id_produto === produto.id_produto);
    
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id_produto: produto.id_produto,
            nome_produto: produto.nome_produto,
            preco: produto.preco,
            imagem_path: produto.imagem_path,
            nome_categoria: produto.nome_categoria,
            quantidade: quantidade
        });
    }
    
    salvarCarrinho();
    atualizarInterface();
    mostrarMensagem(`${produto.nome_produto} adicionado ao carrinho!`, 'success');
}

// Função para remover item do carrinho
function removerDoCarrinho(idProduto) {
    const index = carrinho.findIndex(item => item.id_produto === idProduto);
    if (index !== -1) {
        const nomeItem = carrinho[index].nome_produto;
        carrinho.splice(index, 1);
        salvarCarrinho();
        atualizarInterface();
        mostrarMensagem(`${nomeItem} removido do carrinho!`, 'info');
    }
}

// Função para atualizar quantidade de um item
function atualizarQuantidade(idProduto, novaQuantidade) {
    const item = carrinho.find(item => item.id_produto === idProduto);
    if (item) {
        if (novaQuantidade <= 0) {
            removerDoCarrinho(idProduto);
        } else {
            item.quantidade = novaQuantidade;
            salvarCarrinho();
            atualizarInterface();
        }
    }
}

// Função para limpar carrinho
function limparCarrinho() {
    if (carrinho.length === 0) {
        mostrarMensagem('O carrinho já está vazio!', 'info');
        return;
    }
    
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
        carrinho = [];
        salvarCarrinho();
        atualizarInterface();
        mostrarMensagem('Carrinho limpo com sucesso!', 'success');
    }
}

// Função para calcular subtotal
function calcularSubtotal() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

// Função para calcular total
function calcularTotal() {
    return calcularSubtotal() + TAXA_ENTREGA;
}

// Função para atualizar interface
function atualizarInterface() {
    if (carrinho.length === 0) {
        carrinhoVazio.style.display = 'block';
        carrinhoConteudo.style.display = 'none';
    } else {
        carrinhoVazio.style.display = 'none';
        carrinhoConteudo.style.display = 'grid';
        renderizarItens();
        atualizarResumo();
    }
}

// Função para renderizar itens do carrinho
function renderizarItens() {
    itensCarrinho.innerHTML = '';
    
    carrinho.forEach(item => {
        const itemElement = criarElementoItem(item);
        itensCarrinho.appendChild(itemElement);
    });
}

// Função para criar elemento de item
function criarElementoItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-carrinho';
    
    const imagemHtml = item.imagem_path 
        ? `<img src="${item.imagem_path}" alt="${item.nome_produto}">`
        : '<div style="color: #6c757d; font-size: 12px;">Sem imagem</div>';
    
    itemDiv.innerHTML = `
        <div class="item-imagem">
            ${imagemHtml}
        </div>
        <div class="item-info">
            <h4>${item.nome_produto}</h4>
            <p>${item.nome_categoria || 'Sem categoria'}</p>
        </div>
        <div class="item-preco">
            R$ ${Number(item.preco).toFixed(2)}
        </div>
        <div class="quantidade-controles">
            <button class="btn-quantidade" onclick="atualizarQuantidade(${item.id_produto}, ${item.quantidade - 1})">-</button>
            <input type="number" class="quantidade-input" value="${item.quantidade}" 
                   onchange="atualizarQuantidade(${item.id_produto}, parseInt(this.value) || 0)" min="0">
            <button class="btn-quantidade" onclick="atualizarQuantidade(${item.id_produto}, ${item.quantidade + 1})">+</button>
        </div>
        <button class="btn-remover" onclick="removerDoCarrinho(${item.id_produto})" title="Remover item">
            🗑️
        </button>
    `;
    
    return itemDiv;
}

// Função para atualizar resumo
function atualizarResumo() {
    const subtotal = calcularSubtotal();
    const total = calcularTotal();
    
    subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
    taxaEntregaElement.textContent = `R$ ${TAXA_ENTREGA.toFixed(2)}`;
    totalElement.textContent = `R$ ${total.toFixed(2)}`;
}

// Função para abrir modal de confirmação
function abrirModalConfirmacao() {
    if (carrinho.length === 0) {
        mostrarMensagem('Adicione itens ao carrinho antes de finalizar o pedido!', 'warning');
        return;
    }
    
    const endereco = enderecoInput.value.trim();
    if (!endereco) {
        mostrarMensagem('Por favor, informe o endereço de entrega!', 'warning');
        enderecoInput.focus();
        return;
    }
    
    const total = calcularTotal();
    modalTotal.textContent = `R$ ${total.toFixed(2)}`;
    modalEndereco.textContent = endereco;
    modalConfirmacao.style.display = 'flex';
}

// Função para fechar modal
function fecharModal() {
    modalConfirmacao.style.display = 'none';
}

// Função para finalizar pedido
async function finalizarPedido() {
    try {
        const endereco = enderecoInput.value.trim();
        const observacoes = observacoesInput.value.trim();
        
        const pedido = {
            itens: carrinho,
            endereco: endereco,
            observacoes: observacoes,
            subtotal: calcularSubtotal(),
            taxa_entrega: TAXA_ENTREGA,
            total: calcularTotal(),
            data_pedido: new Date().toISOString()
        };
        
        // Aqui você pode implementar a chamada para a API para salvar o pedido
        console.log('Pedido a ser enviado:', pedido);
        
        // Simular sucesso (substitua pela chamada real da API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Limpar carrinho após sucesso
        carrinho = [];
        salvarCarrinho();
        
        // Fechar modal
        fecharModal();
        
        // Limpar formulário
        enderecoInput.value = '';
        observacoesInput.value = '';
        
        // Atualizar interface
        atualizarInterface();
        
        // Mostrar mensagem de sucesso
        mostrarMensagem('Pedido realizado com sucesso! Em breve entraremos em contato.', 'success');
        
        // Opcional: redirecionar após alguns segundos
        setTimeout(() => {
            window.location.href = '../cardapio/cardapio.html';
        }, 3000);
        
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        mostrarMensagem('Erro ao finalizar pedido. Tente novamente.', 'error');
    }
}

// Função para obter quantidade de itens no carrinho (útil para outras páginas)
function obterQuantidadeItens() {
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
}

// Função para obter valor total do carrinho (útil para outras páginas)
function obterTotalCarrinho() {
    return calcularTotal();
}

// Expor funções globalmente para uso em outras páginas
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.obterQuantidadeItens = obterQuantidadeItens;
window.obterTotalCarrinho = obterTotalCarrinho;
window.atualizarQuantidade = atualizarQuantidade;
window.removerDoCarrinho = removerDoCarrinho;
