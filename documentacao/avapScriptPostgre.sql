-- Criação do schema e configuração do search_path
-- CREATE SCHEMA IF NOT EXISTS loja;
SET search_path TO public;

-- ================================
-- Tabela pessoa (base para cliente e funcionário)
-- ================================
CREATE TABLE pessoa (
    cpf VARCHAR(11) PRIMARY KEY,
    nome_pessoa VARCHAR(100) NOT NULL,
    email_pessoa VARCHAR(100) NOT NULL UNIQUE,
    senha_pessoa VARCHAR(20) NOT NULL
);

-- ================================
-- Tabela cliente
-- ================================
CREATE TABLE cliente (
    cpf VARCHAR(11) PRIMARY KEY,
    FOREIGN KEY (cpf) REFERENCES pessoa(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================
-- Tabela cargo
-- ================================
CREATE TABLE cargo (
    id_cargo SERIAL PRIMARY KEY,
    nome_cargo VARCHAR(100) NOT NULL
);

-- ================================
-- Tabela funcionario
-- ================================
CREATE TABLE funcionario (
    cpf VARCHAR(11) PRIMARY KEY,
    id_cargo INT NOT NULL,
    salario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cpf) REFERENCES pessoa(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_cargo) REFERENCES cargo(id_cargo)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ================================
-- Tabela categoria de produtos
-- ================================
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome_categoria VARCHAR(100) NOT NULL
);

-- ================================
-- Tabela produto
-- ================================
CREATE TABLE produto (
    id_produto SERIAL PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    id_categoria INT NOT NULL,
    quantidade_estoque INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ================================
-- Tabela pedido
-- ================================
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL,
    data_pedido DATE NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cpf) REFERENCES pessoa(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================
-- Tabela pedidoproduto (tabela associativa N:N)
-- ================================
CREATE TABLE pedidoproduto (
    id_produto INT NOT NULL,
    id_pedido INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_produto, id_pedido),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- ================================
-- Tabela pagamento
-- ================================
CREATE TABLE pagamento (
    id_pagamento SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    data_pagamento DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================
-- Tabela forma_pagamento
-- ================================
CREATE TABLE forma_pagamento (
    id_forma_pagamento SERIAL PRIMARY KEY,
    nome_forma VARCHAR(50) NOT NULL
);

-- ================================
-- Tabela pagamento_res (detalhes do pagamento)
-- ================================
CREATE TABLE pagamento_has_formapagamento (
    id_pagamento_res SERIAL PRIMARY KEY,
    id_pagamento INT NOT NULL,
    id_forma_pagamento INT NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pagamento) REFERENCES pagamento(id_pagamento)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_forma_pagamento) REFERENCES forma_pagamento(id_forma_pagamento)
        ON DELETE RESTRICT ON UPDATE CASCADE
);