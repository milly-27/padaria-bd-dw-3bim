const db = require('../database.js');

// ==========================================================
// CLIENTE CONTROLLER
// ==========================================================

// Listar todos os clientes
exports.listarClientes = async (req, res) => {
  try {
    const sql = `
      SELECT c.cpf, p.nome_pessoa, p.email_pessoa, p.senha_pessoa
      FROM cliente c
      JOIN pessoa p ON c.cpf = p.cpf
      ORDER BY p.nome_pessoa
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter cliente por CPF
exports.obterCliente = async (req, res) => {
  try {
    const { cpf } = req.params;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    const sql = `
      SELECT c.cpf, p.nome_pessoa, p.email_pessoa, p.senha_pessoa
      FROM cliente c
      JOIN pessoa p ON c.cpf = p.cpf
      WHERE c.cpf = $1
    `;
    const result = await db.query(sql, [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar cliente (associar CPF já existente em pessoa)
exports.criarCliente = async (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    const sql = `
      INSERT INTO cliente (cpf)
      VALUES ($1)
      RETURNING *
    `;
    const result = await db.query(sql, [cpf]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'CPF já está registrado como cliente' });
    }

    if (error.code === '23503') {
      return res.status(400).json({ error: 'CPF não existe na tabela pessoa' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar cliente (nesse caso não tem muito campo além do CPF)
exports.atualizarCliente = async (req, res) => {
  try {
    const { cpf } = req.params;
    const { novoCpf } = req.body;

    if (!cpf || !novoCpf) {
      return res.status(400).json({ error: 'CPF atual e novo CPF são obrigatórios' });
    }

    const sql = `
      UPDATE cliente
      SET cpf = $1
      WHERE cpf = $2
      RETURNING *
    `;
    const result = await db.query(sql, [novoCpf, cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir cliente
exports.excluirCliente = async (req, res) => {
  try {
    const { cpf } = req.params;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    const sql = `
      DELETE FROM cliente
      WHERE cpf = $1
      RETURNING *
    `;
    const result = await db.query(sql, [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
