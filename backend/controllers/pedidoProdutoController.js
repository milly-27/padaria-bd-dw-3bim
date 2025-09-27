const { query } = require('../database');
const path = require('path');

exports.abrirCrudPedidoProduto = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pedidoProduto/pedidoProduto.html'));
};

// Listar todos
exports.listar = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pedidoproduto ORDER BY id_pedido, id_produto');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidoproduto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar
exports.criar = async (req, res) => {
  try {
    let { id_pedido, id_produto, quantidade, preco_unitario } = req.body;

    // Converte valores
    id_pedido = parseInt(id_pedido, 10);
    id_produto = parseInt(id_produto, 10);
    quantidade = parseInt(quantidade, 10);
    preco_unitario = parseFloat(preco_unitario);

    if (
      isNaN(id_pedido) ||
      isNaN(id_produto) ||
      isNaN(quantidade) ||
      isNaN(preco_unitario)
    ) {
      return res.status(400).json({ error: 'Todos os campos devem ser preenchidos corretamente' });
    }

    const result = await query(
      `INSERT INTO pedidoproduto (id_pedido, id_produto, quantidade, preco_unitario)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_pedido, id_produto, quantidade, preco_unitario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedidoproduto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter
exports.obter = async (req, res) => {
  try {
    let { id_pedido, id_produto } = req.params;

    id_pedido = parseInt(id_pedido, 10);
    id_produto = parseInt(id_produto, 10);

    if (isNaN(id_pedido) || isNaN(id_produto)) {
      return res.status(400).json({ error: 'IDs inválidos. Devem ser números.' });
    }

    const result = await query(
      'SELECT * FROM pedidoproduto WHERE id_pedido = $1 AND id_produto = $2',
      [id_pedido, id_produto]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pedidoproduto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar
exports.atualizar = async (req, res) => {
  try {
    let { id_pedido, id_produto } = req.params;
    let { quantidade, preco_unitario } = req.body;

    id_pedido = parseInt(id_pedido, 10);
    id_produto = parseInt(id_produto, 10);
    quantidade = parseInt(quantidade, 10);
    preco_unitario = parseFloat(preco_unitario);

    if (
      isNaN(id_pedido) ||
      isNaN(id_produto) ||
      isNaN(quantidade) ||
      isNaN(preco_unitario)
    ) {
      return res.status(400).json({ error: 'Dados inválidos. Todos os campos devem ser numéricos.' });
    }

    const result = await query(
      `UPDATE pedidoproduto
       SET quantidade = $1, preco_unitario = $2
       WHERE id_pedido = $3 AND id_produto = $4
       RETURNING *`,
      [quantidade, preco_unitario, id_pedido, id_produto]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedidoproduto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar
exports.deletar = async (req, res) => {
  try {
    let { id_pedido, id_produto } = req.params;

    id_pedido = parseInt(id_pedido, 10);
    id_produto = parseInt(id_produto, 10);

    if (isNaN(id_pedido) || isNaN(id_produto)) {
      return res.status(400).json({ error: 'IDs inválidos. Devem ser números.' });
    }

    const result = await query(
      'DELETE FROM pedidoproduto WHERE id_pedido = $1 AND id_produto = $2 RETURNING *',
      [id_pedido, id_produto]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pedidoproduto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
