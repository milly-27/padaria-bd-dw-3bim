# Sistema de Padaria - Versão Corrigida

## 📋 Sobre o Projeto

Sistema completo de gerenciamento para padaria com funcionalidades de:
- CRUD de produtos com categorias e imagens
- Cardápio digital interativo
- Carrinho de compras funcional
- Gerenciamento de pessoas (funcionários e clientes)
- Sistema de cargos e salários

## 🚀 Funcionalidades Implementadas

### ✅ CRUD de Produtos
- Cadastro completo de produtos
- Upload de imagens
- Associação com categorias
- Controle de estoque
- Exibição com LEFT JOIN (mostra produtos mesmo sem categoria)

### ✅ Cardápio Digital
- Visualização de produtos por categoria
- Filtros dinâmicos
- Indicadores de estoque
- Botões para adicionar ao carrinho
- Interface responsiva

### ✅ Carrinho de Compras
- Adicionar/remover produtos
- Controle de quantidade
- Cálculo automático de totais
- Taxa de entrega
- Formulário de endereço
- Persistência no localStorage
- Modal de confirmação

### ✅ CRUD de Pessoas Avançado
- Cadastro básico de pessoas
- Sistema de funcionários com salário e cargo
- Sistema de clientes
- Integração completa com banco de dados
- Exibição de informações completas na tabela

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Upload de Arquivos**: Multer
- **Estilização**: CSS Grid, Flexbox, Animações

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 14 ou superior)
- PostgreSQL
- npm ou yarn

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
Edite o arquivo `backend/database.js` com suas credenciais:
```javascript
const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'seu_usuario',
  password: 'sua_senha',
  database: 'nome_do_banco'
};
```

### 3. Criar Estrutura do Banco
Execute os scripts SQL para criar as tabelas necessárias (veja estrutura em `teste_funcionalidades.md`).

### 4. Iniciar o Servidor
```bash
npm start
```

O servidor estará disponível em: http://localhost:3001

## 📁 Estrutura do Projeto

```
projeto/
├── backend/
│   ├── controllers/     # Controladores da API
│   ├── routes/         # Rotas da API
│   ├── middleware/     # Middlewares (upload, etc.)
│   ├── uploads/        # Arquivos enviados
│   ├── database.js     # Configuração do banco
│   └── server.js       # Servidor principal
├── frontend/
│   ├── carrinho/       # Página do carrinho
│   ├── cardapio/       # Cardápio digital
│   ├── pessoa/         # CRUD de pessoas
│   ├── produto/        # CRUD de produtos
│   ├── categoria/      # CRUD de categorias
│   ├── cargo/          # CRUD de cargos
│   └── menu.html       # Menu principal
└── documentacao/       # Documentação do projeto
```

## 🔧 Principais Correções Realizadas

### 1. CRUD de Produtos
- **Problema**: Produtos não apareciam na lista
- **Solução**: Alterado INNER JOIN para LEFT JOIN com COALESCE
- **Resultado**: Todos os produtos são exibidos, mesmo sem categoria

### 2. Cardápio
- **Problema**: Mesma questão do CRUD de produtos
- **Solução**: Aplicada mesma correção
- **Resultado**: Cardápio funcional com todos os produtos

### 3. Carrinho de Compras
- **Problema**: Não existia
- **Solução**: Criado sistema completo do zero
- **Resultado**: Carrinho funcional com persistência e integração

### 4. CRUD de Pessoas
- **Problema**: Funcionalidades de funcionário e cliente não funcionavam
- **Solução**: Reescrito sistema completo com integração ao banco
- **Resultado**: Sistema completo de gerenciamento de pessoas

## 🎯 Como Usar

### 1. Gerenciar Produtos
1. Acesse o CRUD de produtos
2. Crie categorias primeiro (opcional)
3. Cadastre produtos com imagens
4. Visualize no cardápio

### 2. Usar o Carrinho
1. Acesse o cardápio
2. Clique em "Adicionar ao Carrinho"
3. Vá para o carrinho
4. Ajuste quantidades e finalize

### 3. Gerenciar Pessoas
1. Acesse o CRUD de pessoas
2. Cadastre dados básicos
3. Marque como funcionário (salário + cargo)
4. Marque como cliente
5. Visualize informações completas

## 🔍 Endpoints da API

### Produtos
- `GET /produtos` - Listar produtos
- `POST /produtos` - Criar produto
- `GET /produtos/:id` - Obter produto
- `PUT /produtos/:id` - Atualizar produto
- `DELETE /produtos/:id` - Deletar produto

### Cardápio
- `GET /cardapio/produtos` - Produtos para cardápio
- `GET /cardapio/categorias` - Categorias para filtro

### Pessoas
- `GET /pessoas` - Listar pessoas
- `POST /pessoas` - Criar pessoa
- `GET /pessoas/:id` - Obter pessoa
- `PUT /pessoas/:id` - Atualizar pessoa

### Funcionários
- `POST /funcionarios` - Criar funcionário
- `GET /funcionarios/pessoa/:cpf` - Obter por CPF

### Clientes
- `POST /clientes` - Criar cliente
- `GET /clientes/pessoa/:cpf` - Obter por CPF

## 🎨 Características da Interface

- **Design Responsivo**: Funciona em desktop e mobile
- **Animações Suaves**: Transições e hover effects
- **Feedback Visual**: Mensagens de sucesso/erro
- **Navegação Intuitiva**: Botões claros e organizados
- **Tema Consistente**: Paleta de cores harmoniosa

## 🐛 Solução de Problemas

### Produtos não aparecem
- Verifique se o banco está conectado
- Confirme se as tabelas existem
- Verifique logs do servidor

### Erro ao adicionar ao carrinho
- Verifique se o localStorage está habilitado
- Confirme se o produto existe
- Verifique console do navegador

### Funcionário/Cliente não salva
- Confirme se a pessoa foi criada primeiro
- Verifique se o CPF está correto
- Confirme se o cargo existe (para funcionários)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Confirme a estrutura do banco de dados
3. Teste as rotas da API individualmente
4. Verifique o console do navegador

## 📄 Licença

Este projeto é para fins educacionais e de demonstração.

---

# padaria-bd-dw-3bim (projeto original)

Sistema de padaria desenvolvido para o 3º bimestre da disciplina de Desenvolvimento Web.
