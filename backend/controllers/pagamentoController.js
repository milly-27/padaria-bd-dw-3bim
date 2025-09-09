const db = require('../database.js');
const path = require('path');

// Abrir página de pagamento
exports.abrirCrudPagamento = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pagamento/pagamento.html'));
};

// Listar todos os pagamentos
exports.listarPagamentos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pg.id_pagamento, pg.forma_pagamento, pg.valor, pg.data_pagamento,
             p.id_pedido, pe.nome_pessoa AS cliente
      FROM pagamento pg
      JOIN pedido p ON pg.id_pedido = p.id_pedido
      JOIN pessoa pe ON p.cpf = pe.cpf
      ORDER BY pg.id_pagamento DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo pagamento
exports.criarPagamento = async (req, res) => {
  try {
    const { id_pedido, forma_pagamento, valor, data_pagamento } = req.body;

    if (!id_pedido || !forma_pagamento || !valor || !data_pagamento) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await db.query(
      'INSERT INTO pagamento (id_pedido, forma_pagamento, valor, data_pagamento) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_pedido, forma_pagamento, valor, data_pagamento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter pagamento por ID
exports.obterPagamento = async (req, res) => {
  try {
    const id_pagamento = parseInt(req.params.id_pagamento);

    const result = await db.query(
      'SELECT * FROM pagamento WHERE id_pagamento = $1',
      [id_pagamento]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar pagamento
exports.atualizarPagamento = async (req, res) => {
  try {
    const id_pagamento = parseInt(req.params.id_pagamento);
    const { forma_pagamento, valor, data_pagamento } = req.body;

    const result = await db.query(
      'UPDATE pagamento SET forma_pagamento = $1, valor = $2, data_pagamento = $3 WHERE id_pagamento = $4 RETURNING *',
      [forma_pagamento, valor, data_pagamento, id_pagamento]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar pagamento
exports.deletarPagamento = async (req, res) => {
  try {
    const id_pagamento = parseInt(req.params.id_pagamento);

    const result = await db.query(
      'DELETE FROM pagamento WHERE id_pagamento = $1 RETURNING *',
      [id_pagamento]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
