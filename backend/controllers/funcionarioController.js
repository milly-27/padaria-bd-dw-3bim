const { query } = require('../database');
const path = require('path');

exports.abrirCrudFuncionario = (req, res) => {
  console.log('funcionarioController - Rota /abrirCrudFuncionario');
  res.sendFile(path.join(__dirname, '../../frontend/funcionario/funcionario.html'));
};

// Listar todos os funcionários
exports.listarFuncionarios = async (req, res) => {
  try {
    const result = await query('SELECT * FROM funcionario ORDER BY cpf');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar funcionarios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar funcionário
exports.criarFuncionario = async (req, res) => {
  try {
    const { cpf, id_cargo, salario } = req.body;

    if (!cpf || !id_cargo || !salario) {
      return res.status(400).json({
        error: 'CPF, cargo e salário são obrigatórios'
      });
    }

    const result = await query(
      'INSERT INTO funcionario (cpf, id_cargo, salario) VALUES ($1, $2, $3) RETURNING *',
      [cpf, id_cargo, salario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar funcionario:', error);

    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter funcionário pelo CPF
exports.obterFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    const result = await query(
      'SELECT * FROM funcionario WHERE cpf = $1',
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter funcionario:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar funcionário
exports.atualizarFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    const { id_cargo, salario } = req.body;

    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE cpf = $1',
      [cpf]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrado' });
    }

    const currentPerson = existingPersonResult.rows[0];

    const newCargo = id_cargo !== undefined ? id_cargo : currentPerson.id_cargo;
    const newSalario = salario !== undefined ? salario : currentPerson.salario;

    const updateResult = await query(
      'UPDATE funcionario SET id_cargo = $1, salario = $2 WHERE cpf = $3 RETURNING *',
      [newCargo, newSalario, cpf]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar funcionario:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar funcionário
exports.deletarFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE cpf = $1',
      [cpf]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrado' });
    }

    await query(
      'DELETE FROM funcionario WHERE cpf = $1',
      [cpf]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar funcionario:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar funcionario com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
