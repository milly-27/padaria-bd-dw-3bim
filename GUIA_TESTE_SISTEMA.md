# 🧪 Guia de Teste do Sistema

## 🚀 Como Iniciar o Sistema

1. **Iniciar o servidor backend:**
```bash
cd "/home/emilly/Área de Trabalho/dw1_Emilly/3bimestre/tentaiva 1-2.0/backend"
node server.js
```

2. **Acessar o sistema:**
   - Abra o navegador em: `http://localhost:3001/menu.html`

---

## ✅ Testes a Realizar

### 📝 Teste 1: Login e Controle de Menu Cadastros

#### 1.1 - Login como Cliente
1. Acesse `http://localhost:3001/login/login.html`
2. Faça login com credenciais de **cliente**
3. **Verificar:**
   - ✅ Redirecionado para `menu.html`
   - ✅ Nome do cliente aparece no topo (no lugar do botão "Login")
   - ✅ Menu "Cadastros" está **OCULTO**
   - ✅ Botão de logout aparece ao lado do nome

#### 1.2 - Login como Funcionário (não-gerente)
1. Faça logout
2. Faça login com credenciais de **funcionário comum**
3. **Verificar:**
   - ✅ Nome do funcionário aparece no topo
   - ✅ Menu "Cadastros" está **OCULTO**

#### 1.3 - Login como Gerente
1. Faça logout
2. Faça login com credenciais de **gerente**
3. **Verificar:**
   - ✅ Nome do gerente aparece no topo
   - ✅ Menu "Cadastros" está **VISÍVEL**
   - ✅ Pode acessar todos os submenu de cadastros

---

### 🛒 Teste 2: Carrinho e Produtos

#### 2.1 - Sem Login
1. **SEM fazer login**, acesse o cardápio: `http://localhost:3001/cardapio/abrirCardapio`
2. Tente adicionar um produto ao carrinho
3. **Verificar:**
   - ✅ Aparece alerta pedindo para fazer login
   - ✅ Opção de redirecionar para página de login

#### 2.2 - Com Login
1. Faça login com qualquer usuário
2. Acesse o cardápio
3. **Verificar:**
   - ✅ Produtos estão carregando corretamente
   - ✅ Imagens dos produtos aparecem
   - ✅ Preços e estoque visíveis
   - ✅ Contador do carrinho mostra "0"

4. Adicione 3 produtos diferentes ao carrinho
5. **Verificar:**
   - ✅ Mensagem de sucesso ao adicionar
   - ✅ Contador do carrinho atualiza (mostra 3)

---

### 💾 Teste 3: Persistência do Carrinho

#### 3.1 - Carrinho Persiste ao Deslogar
1. Com produtos no carrinho, faça **logout**
2. **Verificar:**
   - ✅ Redirecionado para página de login
   - ✅ Carrinho foi "limpo" visualmente

3. Faça **login novamente** com o **mesmo usuário**
4. Acesse o carrinho
5. **Verificar:**
   - ✅ Produtos que você adicionou **ainda estão lá**
   - ✅ Quantidades corretas
   - ✅ Preços corretos

#### 3.2 - Carrinho Isolado por Usuário
1. Faça login com **Usuário A**
2. Adicione **Produto X** ao carrinho
3. Faça logout

4. Faça login com **Usuário B**
5. Acesse o carrinho
6. **Verificar:**
   - ✅ Carrinho está **vazio** (não mostra produtos do Usuário A)

7. Adicione **Produto Y** ao carrinho
8. Faça logout

9. Faça login com **Usuário A** novamente
10. Acesse o carrinho
11. **Verificar:**
    - ✅ Carrinho mostra apenas **Produto X** (do Usuário A)
    - ✅ Não mostra Produto Y (do Usuário B)

---

### 🔍 Teste 4: Verificação no Console do Navegador

1. Abra o **DevTools** (F12)
2. Vá na aba **Console**
3. Faça login
4. **Verificar logs:**
   - ✅ `✅ Resposta do backend:` mostra dados do usuário
   - ✅ `✅ Dados do usuário:` mostra tipo e cargo
   - ✅ `Controlando menu - Tipo: ... Cargo: ...`

5. Vá na aba **Application** → **Local Storage** → `http://localhost:3001`
6. **Verificar:**
   - ✅ Existe chave `carrinho_{cpf}` com os produtos
   - ✅ Exemplo: `carrinho_12345678901`

---

## 🐛 Problemas Comuns e Soluções

### ❌ Produtos não carregam no cardápio
**Solução:**
1. Verifique se o servidor está rodando
2. Abra o console (F12) e veja se há erros
3. Verifique se há produtos cadastrados no banco
4. Teste a rota: `http://localhost:3001/cardapio/produtos`

### ❌ Menu Cadastros não aparece para gerente
**Solução:**
1. Verifique no banco se o cargo está como "gerente" (exatamente)
2. Abra o console e veja os logs de "Controlando menu"
3. Verifique se o funcionário está vinculado ao cargo correto

### ❌ Carrinho não persiste
**Solução:**
1. Abra DevTools → Application → Local Storage
2. Verifique se a chave `carrinho_{cpf}` existe
3. Limpe o localStorage e teste novamente
4. Verifique se o CPF está sendo retornado no login

### ❌ Imagens não aparecem
**Solução:**
1. Verifique se as imagens estão na pasta `/backend/uploads/images/`
2. Verifique se o caminho no banco está correto (ex: `/uploads/images/produto_1.jpg`)
3. Teste acessar diretamente: `http://localhost:3001/uploads/images/nome_imagem.jpg`

---

## 📊 Checklist Final

- [ ] Login como cliente funciona
- [ ] Login como funcionário funciona  
- [ ] Login como gerente funciona
- [ ] Menu Cadastros oculto para cliente
- [ ] Menu Cadastros oculto para funcionário comum
- [ ] Menu Cadastros visível para gerente
- [ ] Nome do usuário aparece após login
- [ ] Produtos carregam no cardápio
- [ ] Adicionar ao carrinho requer login
- [ ] Carrinho persiste ao deslogar
- [ ] Carrinho é isolado por usuário
- [ ] Contador do carrinho atualiza
- [ ] Logout limpa sessão mas mantém carrinho salvo

---

## 🎯 Fluxo Completo de Teste

1. ✅ Acesse sem login → tente adicionar ao carrinho → deve pedir login
2. ✅ Faça login como cliente → menu Cadastros oculto
3. ✅ Adicione 3 produtos ao carrinho
4. ✅ Faça logout
5. ✅ Faça login novamente → carrinho tem os 3 produtos
6. ✅ Faça logout
7. ✅ Faça login como gerente → menu Cadastros visível
8. ✅ Carrinho vazio (é outro usuário)
9. ✅ Adicione 2 produtos
10. ✅ Faça logout e login novamente → carrinho tem os 2 produtos

**Se todos os passos funcionarem, o sistema está 100% operacional! 🎉**
