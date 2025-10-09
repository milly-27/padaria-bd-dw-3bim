# 🛒 Sistema de Carrinho com Banco de Dados

## 📋 Como Funciona Agora

O carrinho agora é **salvo no banco de dados** nas tabelas `pedido` e `pedidoproduto`, não mais apenas no localStorage.

## 🔄 Fluxo Completo

### 1. **Login do Usuário**
```
Usuário faz login → Sistema identifica CPF
```

### 2. **Adicionar Produto ao Carrinho**
```
1. Verifica se usuário está logado
2. Busca ou cria pedido em aberto (sem pagamento) para o CPF
3. Adiciona produto na tabela pedidoproduto
4. Atualiza contador do carrinho
```

### 3. **Logout**
```
1. Usuário faz logout
2. Pedido permanece no banco (em aberto)
3. Carrinho "desaparece" visualmente
```

### 4. **Login Novamente**
```
1. Usuário faz login com mesmo CPF
2. Sistema busca pedido em aberto
3. Carrega produtos do banco
4. Carrinho aparece com os produtos salvos
```

## 🗄️ Estrutura do Banco

### Tabela: `pedido`
```sql
id_pedido (PK)
cpf (FK → pessoa)
data_pedido
valor_total
```

### Tabela: `pedidoproduto`
```sql
id_pedido (PK, FK → pedido)
id_produto (PK, FK → produto)
quantidade
preco_unitario
```

### Tabela: `pagamento`
```sql
id_pagamento (PK)
id_pedido (FK → pedido)
id_forma_pagamento (FK)
valor_total
```

## 🔑 Lógica de Pedido em Aberto

**Pedido em aberto** = Pedido SEM pagamento associado

```sql
SELECT p.* FROM pedido p
LEFT JOIN pagamento pg ON p.id_pedido = pg.id_pedido
WHERE p.cpf = '12345678901' 
  AND pg.id_pagamento IS NULL
ORDER BY p.id_pedido DESC
LIMIT 1
```

## 🚀 Rotas Implementadas

### 1. Buscar ou Criar Pedido em Aberto
```
GET /pedido/aberto/:cpf
```

**Resposta:**
```json
{
  "id_pedido": 5,
  "cpf": "12345678901",
  "data_pedido": "2025-10-07",
  "valor_total": 0
}
```

### 2. Adicionar/Atualizar Item no Carrinho
```
POST /pedidoproduto/carrinho
```

**Body:**
```json
{
  "id_pedido": 5,
  "id_produto": 3,
  "quantidade": 2,
  "preco_unitario": 15.50
}
```

### 3. Buscar Itens do Pedido
```
GET /pedido/:id/itens
```

**Resposta:**
```json
[
  {
    "id_pedido": 5,
    "id_produto": 3,
    "quantidade": 2,
    "preco_unitario": 15.50,
    "nome_produto": "Pão Francês",
    "imagem_produto": "/uploads/images/pao.jpg",
    "nome_categoria": "Pães"
  }
]
```

### 4. Remover Item do Carrinho
```
DELETE /pedidoproduto/:id_pedido/:id_produto
```

## 💻 Frontend - Fluxo de Código

### Adicionar Produto (cardapio.js)
```javascript
async function adicionarProdutoAoCarrinho(idProduto) {
    // 1. Verificar login
    const userData = await verificarLogin();
    
    // 2. Buscar ou criar pedido em aberto
    const pedido = await fetch(`/pedido/aberto/${userData.cpf}`);
    
    // 3. Buscar itens atuais
    const itens = await fetch(`/pedido/${pedido.id_pedido}/itens`);
    
    // 4. Calcular nova quantidade
    const itemExistente = itens.find(i => i.id_produto === idProduto);
    const novaQtd = itemExistente ? itemExistente.quantidade + 1 : 1;
    
    // 5. Salvar no banco
    await fetch('/pedidoproduto/carrinho', {
        method: 'POST',
        body: JSON.stringify({
            id_pedido: pedido.id_pedido,
            id_produto: idProduto,
            quantidade: novaQtd,
            preco_unitario: produto.preco
        })
    });
}
```

### Carregar Carrinho (carrinho.js)
```javascript
async function carregarCarrinho() {
    // 1. Buscar pedido em aberto
    const pedido = await fetch(`/pedido/aberto/${cpf}`);
    
    // 2. Buscar itens
    const itens = await fetch(`/pedido/${pedido.id_pedido}/itens`);
    
    // 3. Converter para formato do carrinho
    carrinho = itens.map(item => ({
        id_produto: item.id_produto,
        nome_produto: item.nome_produto,
        preco: item.preco_unitario,
        quantidade: item.quantidade
    }));
}
```

## ✅ Vantagens do Sistema

1. **Persistência Real**: Dados salvos no banco, não no navegador
2. **Multiplataforma**: Acesse de qualquer dispositivo
3. **Segurança**: Dados no servidor, não no cliente
4. **Histórico**: Pedidos em aberto ficam salvos
5. **Recuperação**: Nunca perde o carrinho

## 🔄 Ciclo de Vida do Pedido

```
1. CRIADO (em aberto)
   ↓
2. PRODUTOS ADICIONADOS (pedidoproduto)
   ↓
3. USUÁRIO DESLOGA (pedido permanece)
   ↓
4. USUÁRIO LOGA NOVAMENTE (pedido carregado)
   ↓
5. FINALIZA COMPRA (pagamento criado)
   ↓
6. PEDIDO FECHADO (tem pagamento)
```

## 🧪 Como Testar

### Teste 1: Adicionar e Persistir
1. Faça login
2. Adicione 3 produtos ao carrinho
3. Faça logout
4. Faça login novamente
5. ✅ Os 3 produtos devem aparecer

### Teste 2: Múltiplos Usuários
1. Login com Usuário A → Adicione Produto X
2. Logout
3. Login com Usuário B → Carrinho vazio
4. Adicione Produto Y
5. Logout
6. Login com Usuário A → Apenas Produto X aparece
7. ✅ Carrinhos isolados por CPF

### Teste 3: Verificar no Banco
```sql
-- Ver pedidos em aberto
SELECT p.*, pe.nome_pessoa 
FROM pedido p
JOIN pessoa pe ON p.cpf = pe.cpf
LEFT JOIN pagamento pg ON p.id_pedido = pg.id_pedido
WHERE pg.id_pagamento IS NULL;

-- Ver itens do pedido 5
SELECT pp.*, pr.nome_produto
FROM pedidoproduto pp
JOIN produto pr ON pp.id_produto = pr.id_produto
WHERE pp.id_pedido = 5;
```

## 📝 Observações Importantes

- ✅ Cada usuário tem 1 pedido em aberto por vez
- ✅ Pedido só fecha quando pagamento é criado
- ✅ Ao finalizar compra, novo pedido em aberto é criado
- ✅ Carrinho persiste entre sessões
- ✅ Dados no banco, não no localStorage

## 🎯 Resumo

**Antes:** Carrinho no localStorage (temporário)
**Agora:** Carrinho no banco de dados (permanente)

**Sistema 100% funcional e persistente!** 🎉
