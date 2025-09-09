const db = require('../database.js');
const path = require('path');

// Abrir página de produto
exports.abrirCrudProduto = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/produto/produto.html'));
};

// Listar produtos
exports.listarProdutos = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id_produto, p.nome_produto, p.preco, p.quantidade_estoque, c.nome_categoria 
       FROM produto p 
       JOIN categoria c ON p.id_categoria = c.id_categoria
       ORDER BY p.id_produto`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar produto
exports.criarProduto = async (req, res) => {
  try {
    const { nome_produto, preco, id_categoria, quantidade_estoque } = req.body;

    if (!nome_produto || !preco || !id_categoria || quantidade_estoque === undefined) {
      return res.status(400).json({
        error: 'Nome, preço, categoria e quantidade em estoque são obrigatórios'
      });
    }

    const result = await db.query(
      `INSERT INTO produto (nome_produto, preco, id_categoria, quantidade_estoque)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome_produto, preco, id_categoria, quantidade_estoque]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter produto por ID
exports.obterProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await db.query(
      `SELECT * FROM produto WHERE id_produto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_produto, preco, id_categoria, quantidade_estoque } = req.body;

    const existingResult = await db.query(
      'SELECT * FROM produto WHERE id_produto = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const current = existingResult.rows[0];
    const updated = {
      nome_produto: nome_produto !== undefined ? nome_produto : current.nome_produto,
      preco: preco !== undefined ? preco : current.preco,
      id_categoria: id_categoria !== undefined ? id_categoria : current.id_categoria,
      quantidade_estoque: quantidade_estoque !== undefined ? quantidade_estoque : current.quantidade_estoque
    };

    const updateResult = await db.query(
      `UPDATE produto
       SET nome_produto = $1, preco = $2, id_categoria = $3, quantidade_estoque = $4
       WHERE id_produto = $5 RETURNING *`,
      [updated.nome_produto, updated.preco, updated.id_categoria, updated.quantidade_estoque, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar produto
exports.deletarProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingResult = await db.query(
      'SELECT * FROM produto WHERE id_produto = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await db.query('DELETE FROM produto WHERE id_produto = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar produto com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
