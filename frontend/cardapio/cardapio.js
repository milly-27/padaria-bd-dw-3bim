// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Variável para armazenar produtos carregados
let produtosCarregados = [];

// Elementos do DOM
const filtroCategoria = document.getElementById('filtroCategoria');
const btnFiltrar = document.getElementById('btnFiltrar');
const produtosContainer = document.getElementById('produtosContainer');
const loadingMessage = document.getElementById('loadingMessage');
const emptyMessage = document.getElementById('emptyMessage');
const messageContainer = document.getElementById('messageContainer');

// Carregar dados ao inicializar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Cardápio carregado, iniciando...');
    await verificarEMostrarUsuario();
    carregarCategorias();
    carregarProdutos();
    atualizarContadorCarrinho();
});

// Função para verificar e mostrar informações do usuário
async function verificarEMostrarUsuario() {
    try {
        const response = await fetch(`${API_BASE_URL}/login/verificaSePessoaEstaLogada`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status === 'ok' && data.cpf) {
            document.getElementById('nomeUsuarioCardapio').textContent = data.nome || 'Usuário';
            console.log('👤 Usuário logado:', data.nome, '- CPF:', data.cpf);
        } else {
            document.getElementById('nomeUsuarioCardapio').textContent = 'Não logado';
        }
    } catch (error) {
        console.error('Erro ao verificar usuário:', error);
    }
}

// Event Listeners
btnFiltrar.addEventListener('click', filtrarProdutos);
filtroCategoria.addEventListener('change', filtrarProdutos);

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

// Função para carregar categorias no filtro
async function carregarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/categorias`);
        if (!response.ok) throw new Error('Erro ao carregar categorias');

        const categorias = await response.json();
        
        // Limpar opções existentes (exceto "Todas as Categorias")
        filtroCategoria.innerHTML = '<option value="todas">Todas as Categorias</option>';

        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id_categoria;
            option.textContent = categoria.nome_categoria;
            filtroCategoria.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        mostrarMensagem('Erro ao carregar categorias', 'error');
    }
}

// Função para carregar produtos
async function carregarProdutos(categoriaId = 'todas') {
    try {
        console.log('📦 Carregando produtos...');
        mostrarLoading(true);
        
        let url = `${API_BASE_URL}/cardapio/produtos`;
        if (categoriaId !== 'todas') {
            url += `?categoria_id=${categoriaId}`;
        }

        console.log('🌐 URL:', url);
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        const produtos = await response.json();
        console.log('✅ Produtos carregados:', produtos.length);
        
        mostrarLoading(false);
        renderizarProdutos(produtos);
        
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        mostrarLoading(false);
        mostrarMensagem('Erro ao carregar produtos: ' + error.message, 'error');
    }
}

// Função para filtrar produtos
function filtrarProdutos() {
    const categoriaId = filtroCategoria.value;
    carregarProdutos(categoriaId);
}

// Função para mostrar/ocultar loading
function mostrarLoading(mostrar) {
    if (mostrar) {
        loadingMessage.style.display = 'block';
        produtosContainer.style.display = 'none';
        emptyMessage.style.display = 'none';
    } else {
        loadingMessage.style.display = 'none';
        produtosContainer.style.display = 'grid';
    }
}

// Função para renderizar produtos
function renderizarProdutos(produtos) {
    console.log('🎨 Renderizando produtos:', produtos);
    produtosCarregados = produtos; // Armazenar produtos para uso posterior
    produtosContainer.innerHTML = '';
    
    if (produtos.length === 0) {
        console.log('⚠️ Nenhum produto para exibir');
        produtosContainer.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    produtosContainer.style.display = 'grid';

    produtos.forEach(produto => {
        const produtoCard = criarCardProduto(produto);
        produtosContainer.appendChild(produtoCard);
    });
    
    console.log('✅ Produtos renderizados com sucesso');
}

// Função para criar card do produto
function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.className = 'produto-card';
    
    // Determinar classe do estoque
    let estoqueClasse = '';
    let estoqueTexto = `Estoque: ${produto.quantidade_estoque} unidades`;
    let botaoDisabled = '';
    
    if (produto.quantidade_estoque === 0) {
        estoqueClasse = 'estoque-zero';
        estoqueTexto = 'Produto esgotado';
        botaoDisabled = 'disabled';
    } else if (produto.quantidade_estoque <= 5) {
        estoqueClasse = 'estoque-baixo';
        estoqueTexto = `Últimas ${produto.quantidade_estoque} unidades`;
    }
    
    // HTML da imagem - ajustar caminho se necessário
    let imagemSrc = produto.imagem_produto;
    if (imagemSrc && !imagemSrc.startsWith('http')) {
        // Se não começar com http, adicionar o caminho do servidor
        imagemSrc = `http://localhost:3001${imagemSrc}`;
    }
    
    const imagemHtml = imagemSrc 
        ? `<img src="${imagemSrc}" alt="${produto.nome_produto}" onerror="this.parentElement.innerHTML='<div class=\\'sem-imagem\\'>Sem imagem</div>'">`
        : '<div class="sem-imagem">Sem imagem disponível</div>';
    
    card.innerHTML = `
        <div class="produto-imagem">
            ${imagemHtml}
        </div>
        <div class="produto-info">
            <h3 class="produto-nome">${produto.nome_produto}</h3>
            <span class="produto-categoria">${produto.nome_categoria}</span>
            <div class="produto-preco">R$ ${Number(produto.preco).toFixed(2)}</div>
            <div class="produto-estoque ${estoqueClasse}">${estoqueTexto}</div>
            <button class="btn-adicionar-carrinho" ${botaoDisabled} 
                    onclick="adicionarProdutoAoCarrinho(${produto.id_produto})">
                ${produto.quantidade_estoque === 0 ? 'Esgotado' : '🛒 Adicionar'}
            </button>
        </div>
    `;
    
    return card;
}

// Função para adicionar produto ao carrinho
async function adicionarProdutoAoCarrinho(idProduto) {
    // 🔒 VERIFICAR SE USUÁRIO ESTÁ LOGADO
    let usuarioLogado = null;
    try {
        const response = await fetch(`${API_BASE_URL}/login/verificaSePessoaEstaLogada`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status !== 'ok' || !data.cpf) {
            // Usuário NÃO está logado
            if (confirm('⚠️ Você precisa fazer login para adicionar produtos ao carrinho!\n\nDeseja ir para a página de login?')) {
                window.location.href = '../login/login.html';
            }
            return;
        }
        
        usuarioLogado = data;
    } catch (error) {
        console.error('Erro ao verificar login:', error);
        alert('⚠️ Erro ao verificar login. Por favor, faça login novamente.');
        return;
    }
    
    // Usuário está logado, continuar com a adição
    const produto = produtosCarregados.find(p => p.id_produto === idProduto);
    if (!produto) {
        mostrarMensagem('Produto não encontrado!', 'error');
        return;
    }
    
    if (produto.quantidade_estoque === 0) {
        mostrarMensagem('Produto esgotado!', 'warning');
        return;
    }
    
    try {
        console.log('🛒 Adicionando produto ao carrinho e salvando no banco...', { idProduto, cpf: usuarioLogado.cpf });
        
        // 1. Buscar ou criar pedido em aberto (sem pagamento) do usuário
        const pedidosResponse = await fetch(`${API_BASE_URL}/pedido/cpf/${usuarioLogado.cpf}`);
        const pedidos = await pedidosResponse.json();
        
        // Filtrar pedidos sem pagamento
        let pedidoAberto = null;
        const pagamentoResponse = await fetch(`${API_BASE_URL}/pagamento`);
        const pagamentos = await pagamentoResponse.json();
        
        for (const p of pedidos) {
            const temPagamento = pagamentos.some(pag => pag.id_pedido === p.id_pedido);
            if (!temPagamento) {
                pedidoAberto = p;
                break;
            }
        }
        
        // 2. Se não existe pedido em aberto, criar um novo
        if (!pedidoAberto) {
            console.log('📦 Criando novo pedido para CPF:', usuarioLogado.cpf);
            const novoPedidoResponse = await fetch(`${API_BASE_URL}/pedido`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cpf: usuarioLogado.cpf,
                    valor_total: 0
                })
            });
            
            console.log('📡 Status da criação:', novoPedidoResponse.status);
            
            if (!novoPedidoResponse.ok) {
                const errorData = await novoPedidoResponse.json();
                console.error('❌ Erro ao criar pedido:', errorData);
                throw new Error(errorData.error || 'Erro ao criar pedido');
            }
            
            pedidoAberto = await novoPedidoResponse.json();
            console.log('✅ Novo pedido criado:', pedidoAberto);
        }
        
        // 3. Buscar itens atuais do pedido
        const itensResponse = await fetch(`${API_BASE_URL}/pedido/${pedidoAberto.id_pedido}/itens`);
        let itens = await itensResponse.json();
        
        if (!Array.isArray(itens)) {
            itens = [];
        }
        
        // 4. Verificar se produto já está no pedido
        const itemExistente = itens.find(item => item.id_produto === idProduto);
        const novaQuantidade = itemExistente ? itemExistente.quantidade + 1 : 1;
        
        if (novaQuantidade > produto.quantidade_estoque) {
            mostrarMensagem('Quantidade máxima em estoque já adicionada!', 'warning');
            return;
        }
        
        // 5. Adicionar ou atualizar item no banco
        const itemResponse = await fetch(`${API_BASE_URL}/pedidoproduto/carrinho`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_pedido: pedidoAberto.id_pedido,
                id_produto: idProduto,
                quantidade: novaQuantidade,
                preco_unitario: produto.preco
            })
        });
        
        if (!itemResponse.ok) {
            throw new Error('Erro ao adicionar produto ao pedido');
        }
        
        console.log('✅ Item salvo no banco');
        
        // 6. Atualizar valor total do pedido
        const novoValorTotal = itemExistente 
            ? pedidoAberto.valor_total + produto.preco 
            : pedidoAberto.valor_total + (produto.preco * novaQuantidade);
            
        await fetch(`${API_BASE_URL}/pedido/${pedidoAberto.id_pedido}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cpf: pedidoAberto.cpf,
                data_pedido: pedidoAberto.data_pedido,
                valor_total: novoValorTotal
            })
        });
        
        // 7. Atualizar contador do carrinho
        atualizarContadorCarrinho();
        
        // 8. Mostrar mensagem de sucesso
        mostrarMensagem(`✅ ${produto.nome_produto} adicionado ao carrinho!`, 'success');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar ao carrinho:', error);
        mostrarMensagem(`❌ Erro: ${error.message}`, 'error');
    }
}

// Função para atualizar contador do carrinho
async function atualizarContadorCarrinho() {
    const carrinhoCount = document.getElementById('carrinhoCount');
    if (!carrinhoCount) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/login/verificaSePessoaEstaLogada`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status !== 'ok' || !data.cpf) {
            carrinhoCount.textContent = '0';
            return;
        }
        
        // Buscar pedidos do usuário no banco
        const pedidosResponse = await fetch(`${API_BASE_URL}/pedido/cpf/${data.cpf}`);
        const pedidos = await pedidosResponse.json();
        
        // Encontrar pedido em aberto
        const pagamentoResponse = await fetch(`${API_BASE_URL}/pagamento`);
        const pagamentos = await pagamentoResponse.json();
        
        let pedidoAberto = null;
        for (const p of pedidos) {
            const temPagamento = pagamentos.some(pag => pag.id_pedido === p.id_pedido);
            if (!temPagamento) {
                pedidoAberto = p;
                break;
            }
        }
        
        if (!pedidoAberto) {
            carrinhoCount.textContent = '0';
            return;
        }
        
        // Buscar itens do pedido
        const itensResponse = await fetch(`${API_BASE_URL}/pedido/${pedidoAberto.id_pedido}/itens`);
        let itens = await itensResponse.json();
        
        if (!Array.isArray(itens)) {
            itens = [];
        }
        
        const totalItens = itens.reduce((total, item) => total + item.quantidade, 0);
        carrinhoCount.textContent = totalItens;
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
        carrinhoCount.textContent = '0';
    }
}
