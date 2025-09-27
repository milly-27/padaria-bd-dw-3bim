const { query } = require('../database');
const path = require('path');

exports.abrirCrudPagamento = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pagamento/pagamento.html'));
}

exports.listarPagamentos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pagamento ORDER BY id_pagamento');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarPagamento = async (req, res) => {
  try {
    const { id_pedido, data_pagamento, valor_total } = req.body;

    if (!id_pedido || !data_pagamento || !valor_total) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await query(
      'INSERT INTO pagamento (id_pedido, data_pagamento, valor_total) VALUES ($1, $2, $3) RETURNING *',
      [id_pedido, data_pagamento, valor_total]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const result = await query('SELECT * FROM pagamento WHERE id_pagamento = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_pedido, data_pagamento, valor_total } = req.body;

    const existingResult = await query('SELECT * FROM pagamento WHERE id_pagamento = $1', [id]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const pagamentoAtual = existingResult.rows[0];
    const updatedFields = {
      id_pedido: id_pedido !== undefined ? id_pedido : pagamentoAtual.id_pedido,
      data_pagamento: data_pagamento !== undefined ? data_pagamento : pagamentoAtual.data_pagamento,
      valor_total: valor_total !== undefined ? valor_total : pagamentoAtual.valor_total
    };

    const updateResult = await query(
      'UPDATE pagamento SET id_pedido = $1, data_pagamento = $2, valor_total = $3 WHERE id_pagamento = $4 RETURNING *',
      [updatedFields.id_pedido, updatedFields.data_pagamento, updatedFields.valor_total, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingResult = await query('SELECT * FROM pagamento WHERE id_pagamento = $1', [id]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    await query('DELETE FROM pagamento WHERE id_pagamento = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
