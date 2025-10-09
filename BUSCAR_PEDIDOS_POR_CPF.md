# 🔍 Buscar Pedidos por CPF

## 📋 Funcionalidade Implementada

Agora você pode buscar todos os pedidos de uma pessoa específica usando o CPF.

## 🚀 Como Usar

### 1. **Rota da API**

```
GET http://localhost:3001/pedido/cpf/{cpf}
```

**Exemplo:**
```
GET http://localhost:3001/pedido/cpf/12345678901
```

### 2. **Resposta da API**

A API retorna um array com todos os pedidos da pessoa, incluindo:

```json
[
  {
    "id_pedido": 1,
    "cpf": "12345678901",
    "data_pedido": "2025-10-07",
    "valor_total": 150.50,
    "nome_pessoa": "João Silva",
    "email_pessoa": "joao@email.com"
  },
  {
    "id_pedido": 2,
    "cpf": "12345678901",
    "data_pedido": "2025-10-06",
    "valor_total": 89.90,
    "nome_pessoa": "João Silva",
    "email_pessoa": "joao@email.com"
  }
]
```

### 3. **Usar no Frontend (JavaScript)**

```javascript
// Buscar pedidos do usuário logado
async function buscarMeusPedidos() {
    try {
        // Pegar CPF do usuário logado
        const response = await fetch('http://localhost:3001/login/verificaSePessoaEstaLogada', {
            credentials: 'include'
        });
        const userData = await response.json();
        
        if (userData.status === 'ok' && userData.cpf) {
            // Buscar pedidos pelo CPF
            const pedidosResponse = await fetch(`http://localhost:3001/pedido/cpf/${userData.cpf}`);
            const pedidos = await pedidosResponse.json();
            
            console.log('Meus pedidos:', pedidos);
            return pedidos;
        }
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
    }
}

// Chamar a função
buscarMeusPedidos();
```

### 4. **Buscar Itens de um Pedido Específico**

Depois de ter o `id_pedido`, você pode buscar os produtos desse pedido:

```javascript
async function buscarItensDoPedido(idPedido) {
    try {
        const response = await fetch(`http://localhost:3001/pedido/${idPedido}/itens`);
        const itens = await response.json();
        
        console.log('Itens do pedido:', itens);
        return itens;
    } catch (error) {
        console.error('Erro ao buscar itens:', error);
    }
}

// Exemplo de uso
buscarItensDoPedido(1);
```

**Resposta:**
```json
[
  {
    "id_pedido": 1,
    "id_produto": 5,
    "quantidade": 2,
    "preco_unitario": 15.50,
    "nome_produto": "Pão Francês",
    "imagem_path": "/uploads/images/pao.jpg",
    "id_categoria": 1
  },
  {
    "id_pedido": 1,
    "id_produto": 8,
    "quantidade": 1,
    "preco_unitario": 25.00,
    "nome_produto": "Bolo de Chocolate",
    "imagem_path": "/uploads/images/bolo.jpg",
    "id_categoria": 2
  }
]
```

## 💡 Casos de Uso

### 1. **Página "Meus Pedidos"**

Criar uma página onde o cliente vê todos os seus pedidos:

```javascript
async function exibirMeusPedidos() {
    const pedidos = await buscarMeusPedidos();
    
    const container = document.getElementById('pedidosContainer');
    container.innerHTML = '';
    
    pedidos.forEach(pedido => {
        const pedidoDiv = document.createElement('div');
        pedidoDiv.className = 'pedido-card';
        pedidoDiv.innerHTML = `
            <h3>Pedido #${pedido.id_pedido}</h3>
            <p>Data: ${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
            <p>Valor Total: R$ ${Number(pedido.valor_total).toFixed(2)}</p>
            <button onclick="verDetalhesPedido(${pedido.id_pedido})">Ver Detalhes</button>
        `;
        container.appendChild(pedidoDiv);
    });
}
```

### 2. **Histórico de Compras**

```javascript
async function exibirHistorico() {
    const pedidos = await buscarMeusPedidos();
    
    if (pedidos.length === 0) {
        alert('Você ainda não fez nenhum pedido.');
        return;
    }
    
    console.log(`Você tem ${pedidos.length} pedido(s)`);
    
    // Calcular total gasto
    const totalGasto = pedidos.reduce((sum, p) => sum + Number(p.valor_total), 0);
    console.log(`Total gasto: R$ ${totalGasto.toFixed(2)}`);
}
```

### 3. **Detalhes Completos de um Pedido**

```javascript
async function verDetalhesPedido(idPedido) {
    try {
        // Buscar dados do pedido
        const pedidoResponse = await fetch(`http://localhost:3001/pedido/${idPedido}`);
        const pedido = await pedidoResponse.json();
        
        // Buscar itens do pedido
        const itensResponse = await fetch(`http://localhost:3001/pedido/${idPedido}/itens`);
        const itens = await itensResponse.json();
        
        console.log('Pedido:', pedido);
        console.log('Itens:', itens);
        
        // Exibir em modal ou página
        exibirModalPedido(pedido, itens);
    } catch (error) {
        console.error('Erro:', error);
    }
}
```

## 🔐 Segurança

- ✅ A rota verifica se o CPF existe
- ✅ Retorna apenas pedidos do CPF especificado
- ✅ Ordenado por data (mais recentes primeiro)
- ✅ Inclui informações da pessoa (nome e email)

## 📝 Exemplo Completo - HTML

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Meus Pedidos</title>
</head>
<body>
    <h1>Meus Pedidos</h1>
    <div id="pedidosContainer"></div>
    
    <script>
        async function carregarPedidos() {
            try {
                // Verificar usuário logado
                const userResponse = await fetch('http://localhost:3001/login/verificaSePessoaEstaLogada', {
                    credentials: 'include'
                });
                const userData = await userResponse.json();
                
                if (userData.status !== 'ok') {
                    alert('Faça login para ver seus pedidos');
                    window.location.href = '/login/login.html';
                    return;
                }
                
                // Buscar pedidos
                const pedidosResponse = await fetch(`http://localhost:3001/pedido/cpf/${userData.cpf}`);
                const pedidos = await pedidosResponse.json();
                
                // Exibir pedidos
                const container = document.getElementById('pedidosContainer');
                
                if (pedidos.length === 0) {
                    container.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
                    return;
                }
                
                pedidos.forEach(pedido => {
                    const div = document.createElement('div');
                    div.style.border = '1px solid #ccc';
                    div.style.padding = '10px';
                    div.style.marginBottom = '10px';
                    div.innerHTML = `
                        <h3>Pedido #${pedido.id_pedido}</h3>
                        <p><strong>Data:</strong> ${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Valor:</strong> R$ ${Number(pedido.valor_total).toFixed(2)}</p>
                    `;
                    container.appendChild(div);
                });
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao carregar pedidos');
            }
        }
        
        // Carregar ao abrir a página
        window.addEventListener('load', carregarPedidos);
    </script>
</body>
</html>
```

## ✅ Resumo

**Rotas disponíveis:**

1. `GET /pedido/cpf/:cpf` - Buscar todos os pedidos de um CPF
2. `GET /pedido/:id/itens` - Buscar itens de um pedido específico
3. `GET /pedido/:id` - Buscar dados de um pedido específico

**Tudo pronto para usar!** 🎉
