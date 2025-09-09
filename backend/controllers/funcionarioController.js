const db = require('../database.js');

// ===================== FUNCIONÁRIO =====================

// Listar todos os funcionários com o nome do cargo
exports.listarFuncionarios = async (req, res) => {
  try {
    const sql = `
      SELECT f.cpf, p.nome_pessoa, p.email_pessoa, f.salario, c.id_cargo, c.nome_cargo
      FROM funcionario f
      JOIN pessoa p ON f.cpf = p.cpf
      JOIN cargo c ON f.id_cargo = c.id_cargo
      ORDER BY p.nome_pessoa
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Obter um funcionário pelo CPF
exports.obterFuncionario = async (req, res) => {
  try {
    const { cpf } = req.params;
    const sql = `
      SELECT f.cpf, p.nome_pessoa, p.email_pessoa, f.salario, c.id_cargo, c.nome_cargo
      FROM funcionario f
      JOIN pessoa p ON f.cpf = p.cpf
      JOIN cargo c ON f.id_cargo = c.id_cargo
      WHERE f.cpf = $1
    `;
    const result = await db.query(sql, [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao obter funcionário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Criar um novo funcionário
exports.criarFuncionario = async (req, res) => {
  try {
    const { cpf, id_cargo, salario } = req.body;

    if (!cpf || !id_cargo || !salario) {
      return res.status(400).json({ error: "CPF, cargo e salário são obrigatórios" });
    }

    const sql = `
      INSERT INTO funcionario (cpf, id_cargo, salario)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(sql, [cpf, id_cargo, salario]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Atualizar funcionário
exports.atualizarFuncionario = async (req, res) => {
  try {
    const { cpf } = req.params;
    const { id_cargo, salario } = req.body;

    const sql = `
      UPDATE funcionario
      SET id_cargo = $1, salario = $2
      WHERE cpf = $3
      RETURNING *
    `;
    const result = await db.query(sql, [id_cargo, salario, cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Excluir funcionário
exports.excluirFuncionario = async (req, res) => {
  try {
    const { cpf } = req.params;

    const sql = `DELETE FROM funcionario WHERE cpf = $1 RETURNING *`;
    const result = await db.query(sql, [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    res.json({ message: "Funcionário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ===================== CARGO =====================

// Listar cargos
exports.listarCargos = async (req, res) => {
  try {
    const sql = `SELECT * FROM cargo ORDER BY nome_cargo`;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar cargos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Criar cargo
exports.criarCargo = async (req, res) => {
  try {
    const { nome_cargo } = req.body;

    if (!nome_cargo) {
      return res.status(400).json({ error: "Nome do cargo é obrigatório" });
    }

    const sql = `INSERT INTO cargo (nome_cargo) VALUES ($1) RETURNING *`;
    const result = await db.query(sql, [nome_cargo]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar cargo:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
