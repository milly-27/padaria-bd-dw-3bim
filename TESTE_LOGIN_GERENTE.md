# 🔍 TESTE - Login de Gerente

## Problema Relatado:
1. ❌ Nome da pessoa logada não aparece
2. ❌ Botão "Cadastros" não aparece para gerente

## ✅ Correções Aplicadas:

### 1. Arquivo `menu.js` corrigido
- Adicionados logs detalhados no console
- Função `verificarSeUsuarioEstaLogadoBackend()` chamada ao carregar página
- Função `mostrarUsuarioLogado()` exibe nome e controla menu

### 2. Como Testar:

#### Passo 1: Abra o Console do Navegador
- Pressione F12
- Vá na aba "Console"

#### Passo 2: Faça Login como Gerente
1. Acesse: http://localhost:3001/login/login.html
2. Faça login com credenciais de um gerente
3. Você será redirecionado para menu.html

#### Passo 3: Verifique no Console
Você deve ver estas mensagens:
```
📄 Página carregada, verificando login...
✅ Resposta do backend: {status: 'ok', nome: 'Nome do Gerente', tipo: 'funcionario', cargo: 'gerente', cpf: '...'}
✅ Dados do usuário: {nome: 'Nome do Gerente', cpf: '...', tipo: 'funcionario', cargo: 'gerente'}
Controlando menu - Tipo: funcionario Cargo: gerente
Menu Cadastros VISÍVEL (gerente)
```

#### Passo 4: Verifique Visualmente
- ✅ Seu nome deve aparecer no canto superior direito
- ✅ Menu "Cadastros" deve estar visível
- ✅ Ao passar mouse no nome, deve aparecer tooltip "Clique para deslogar"

## 🐛 Se NÃO Funcionar:

### Verifique no Console:
1. **Se aparecer erro 404 ou CORS**: Servidor não está rodando
2. **Se aparecer "Usuário não está logado"**: Cookies não foram salvos
3. **Se não aparecer nenhuma mensagem**: JavaScript não está carregando

### Soluções:

#### Problema 1: Servidor não está rodando
```bash
cd "tentaiva 1-2.0"
npm start
```

#### Problema 2: Cookies não salvos
- Verifique se o login retornou `status: 'ok'`
- Abra DevTools > Application > Cookies
- Deve ter: `pessoaLogada`, `tipoPessoa`, `cargoPessoa`, `idPessoa`

#### Problema 3: Cargo não é "gerente"
No banco de dados, verifique:
```sql
SELECT p.nome_pessoa, c.nome_cargo 
FROM pessoa p
INNER JOIN funcionario f ON p.cpf = f.cpf
INNER JOIN cargo c ON f.id_cargo = c.id_cargo
WHERE p.email_pessoa = 'email_do_gerente@email.com';
```

O campo `nome_cargo` deve ser exatamente **"gerente"** (minúsculo ou maiúsculo, o código aceita ambos).

## 📝 Estrutura Esperada no Banco:

### Tabela cargo
```sql
INSERT INTO cargo (nome_cargo) VALUES ('gerente');
INSERT INTO cargo (nome_cargo) VALUES ('atendente');
```

### Tabela pessoa
```sql
INSERT INTO pessoa (cpf, nome_pessoa, email_pessoa, senha_pessoa) 
VALUES ('12345678901', 'João Gerente', 'gerente@email.com', '1234');
```

### Tabela funcionario
```sql
INSERT INTO funcionario (cpf, salario_funcionario, id_cargo) 
VALUES ('12345678901', 5000.00, 1); -- 1 = id do cargo "gerente"
```

## 🔧 Comandos Úteis para Debug:

### 1. Ver todos os gerentes:
```sql
SELECT p.cpf, p.nome_pessoa, p.email_pessoa, c.nome_cargo
FROM pessoa p
INNER JOIN funcionario f ON p.cpf = f.cpf
INNER JOIN cargo c ON f.id_cargo = c.id_cargo
WHERE c.nome_cargo ILIKE 'gerente';
```

### 2. Criar um gerente de teste:
```sql
-- 1. Criar cargo gerente (se não existir)
INSERT INTO cargo (nome_cargo) VALUES ('gerente') 
ON CONFLICT DO NOTHING;

-- 2. Criar pessoa
INSERT INTO pessoa (cpf, nome_pessoa, email_pessoa, senha_pessoa) 
VALUES ('99999999999', 'Teste Gerente', 'teste@gerente.com', '1234')
ON CONFLICT (cpf) DO NOTHING;

-- 3. Criar funcionário gerente
INSERT INTO funcionario (cpf, salario_funcionario, id_cargo) 
VALUES ('99999999999', 5000.00, (SELECT id_cargo FROM cargo WHERE nome_cargo = 'gerente'))
ON CONFLICT (cpf) DO NOTHING;
```

Agora tente fazer login com:
- **Email**: teste@gerente.com
- **Senha**: 1234

## ✅ Checklist Final:

- [ ] Servidor está rodando (npm start)
- [ ] Banco de dados tem cargo "gerente"
- [ ] Usuário está cadastrado como funcionário com cargo gerente
- [ ] Console do navegador está aberto (F12)
- [ ] Fez login e foi redirecionado para menu.html
- [ ] Viu as mensagens no console
- [ ] Nome apareceu no canto superior direito
- [ ] Menu "Cadastros" está visível

Se todos os itens estiverem marcados e ainda não funcionar, me avise com o print do console!
