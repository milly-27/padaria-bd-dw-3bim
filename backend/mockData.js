// Dados mockados para teste sem banco de dados
let pessoas = [
    {
        id_pessoa: 1,
        cpf_pessoa: '12345678901',
        nome_pessoa: 'João Silva',
        email_pessoa: 'joao@email.com',
        senha_pessoa: '123456'
    },
    {
        id_pessoa: 2,
        cpf_pessoa: '98765432100',
        nome_pessoa: 'Maria Santos',
        email_pessoa: 'maria@email.com',
        senha_pessoa: '123456'
    }
];

let produtos = [
    {
        id_produto: 1,
        nome_produto: 'Pão Francês',
        preco: 0.50,
        quantidade_estoque: 100,
        id_categoria: 1,
        imagem_path: null,
        nome_categoria: 'Pães'
    },
    {
        id_produto: 2,
        nome_produto: 'Croissant',
        preco: 3.50,
        quantidade_estoque: 20,
        id_categoria: 1,
        imagem_path: null,
        nome_categoria: 'Pães'
    },
    {
        id_produto: 3,
        nome_produto: 'Bolo de Chocolate',
        preco: 25.00,
        quantidade_estoque: 5,
        id_categoria: 2,
        imagem_path: null,
        nome_categoria: 'Bolos'
    }
];

let categorias = [
    {
        id_categoria: 1,
        nome_categoria: 'Pães'
    },
    {
        id_categoria: 2,
        nome_categoria: 'Bolos'
    },
    {
        id_categoria: 3,
        nome_categoria: 'Doces'
    }
];

let cargos = [
    {
        id_cargo: 1,
        nome_cargo: 'Padeiro'
    },
    {
        id_cargo: 2,
        nome_cargo: 'Vendedor'
    },
    {
        id_cargo: 3,
        nome_cargo: 'Gerente'
    }
];

let funcionarios = [
    {
        cpf_pessoa: '12345678901',
        salario_funcionario: 2500.00,
        id_cargo: 1,
        nome_cargo: 'Padeiro'
    }
];

let clientes = [
    {
        cpf_pessoa: '98765432100'
    }
];

// Funções para simular operações do banco
const mockDatabase = {
    // Pessoas
    async listarPessoas() {
        return { rows: pessoas };
    },

    async criarPessoa(dados) {
        const novoId = Math.max(...pessoas.map(p => p.id_pessoa), 0) + 1;
        const novaPessoa = {
            id_pessoa: dados.id_pessoa || novoId,
            cpf_pessoa: dados.cpf_pessoa,
            nome_pessoa: dados.nome_pessoa,
            email_pessoa: dados.email_pessoa,
            senha_pessoa: dados.senha_pessoa
        };
        pessoas.push(novaPessoa);
        return { rows: [novaPessoa] };
    },

    async obterPessoa(id) {
        const pessoa = pessoas.find(p => p.id_pessoa == id);
        return { rows: pessoa ? [pessoa] : [] };
    },

    async atualizarPessoa(id, dados) {
        const index = pessoas.findIndex(p => p.id_pessoa == id);
        if (index !== -1) {
            pessoas[index] = { ...pessoas[index], ...dados };
            return { rows: [pessoas[index]] };
        }
        return { rows: [] };
    },

    async deletarPessoa(id) {
        const index = pessoas.findIndex(p => p.id_pessoa == id);
        if (index !== -1) {
            pessoas.splice(index, 1);
            return { rows: [] };
        }
        return { rows: [] };
    },

    // Produtos
    async listarProdutos() {
        return { rows: produtos };
    },

    async criarProduto(dados) {
        const novoId = Math.max(...produtos.map(p => p.id_produto), 0) + 1;
        const categoria = categorias.find(c => c.id_categoria == dados.id_categoria);
        const novoProduto = {
            id_produto: dados.id_produto || novoId,
            nome_produto: dados.nome_produto,
            preco: dados.preco,
            quantidade_estoque: dados.quantidade_estoque,
            id_categoria: dados.id_categoria,
            imagem_path: dados.imagem_path || null,
            nome_categoria: categoria ? categoria.nome_categoria : 'Sem categoria'
        };
        produtos.push(novoProduto);
        return { rows: [novoProduto] };
    },

    async obterProduto(id) {
        const produto = produtos.find(p => p.id_produto == id);
        return { rows: produto ? [produto] : [] };
    },

    async atualizarProduto(id, dados) {
        const index = produtos.findIndex(p => p.id_produto == id);
        if (index !== -1) {
            const categoria = categorias.find(c => c.id_categoria == dados.id_categoria);
            produtos[index] = { 
                ...produtos[index], 
                ...dados,
                nome_categoria: categoria ? categoria.nome_categoria : 'Sem categoria'
            };
            return { rows: [produtos[index]] };
        }
        return { rows: [] };
    },

    async deletarProduto(id) {
        const index = produtos.findIndex(p => p.id_produto == id);
        if (index !== -1) {
            produtos.splice(index, 1);
            return { rows: [] };
        }
        return { rows: [] };
    },

    // Categorias
    async listarCategorias() {
        return { rows: categorias };
    },

    // Cargos
    async listarCargos() {
        return { rows: cargos };
    },

    // Funcionários
    async criarFuncionario(dados) {
        const cargo = cargos.find(c => c.id_cargo == dados.id_cargo);
        const novoFuncionario = {
            cpf_pessoa: dados.cpf_pessoa,
            salario_funcionario: dados.salario_funcionario,
            id_cargo: dados.id_cargo,
            nome_cargo: cargo ? cargo.nome_cargo : 'Cargo não encontrado'
        };
        
        // Remove funcionário existente se houver
        const index = funcionarios.findIndex(f => f.cpf_pessoa === dados.cpf_pessoa);
        if (index !== -1) {
            funcionarios[index] = novoFuncionario;
        } else {
            funcionarios.push(novoFuncionario);
        }
        
        return { rows: [novoFuncionario] };
    },

    async obterFuncionarioPorCpf(cpf) {
        const funcionario = funcionarios.find(f => f.cpf_pessoa === cpf);
        return { rows: funcionario ? [funcionario] : [] };
    },

    // Clientes
    async criarCliente(dados) {
        const novoCliente = {
            cpf_pessoa: dados.cpf_pessoa
        };
        
        // Remove cliente existente se houver
        const index = clientes.findIndex(c => c.cpf_pessoa === dados.cpf_pessoa);
        if (index === -1) {
            clientes.push(novoCliente);
        }
        
        return { rows: [novoCliente] };
    },

    async obterClientePorCpf(cpf) {
        const cliente = clientes.find(c => c.cpf_pessoa === cpf);
        return { rows: cliente ? [cliente] : [] };
    },

    // Login
    async verificarLogin(email, senha) {
        const pessoa = pessoas.find(p => p.email_pessoa === email && p.senha_pessoa === senha);
        return { rows: pessoa ? [pessoa] : [] };
    },

    async verificarEmailExiste(email) {
        const pessoa = pessoas.find(p => p.email_pessoa === email);
        return { rows: pessoa ? [pessoa] : [] };
    }
};

module.exports = mockDatabase;
