const db = require('../database.js');

exports.verificaSeUsuarioEstaLogado = (req, res) => {
  console.log('loginController - Acessando rota /verificaSeUsuarioEstaLogado');
  let nome = req.cookies.usuarioLogado;
  console.log('Cookie usuarioLogado:', nome);
  nome = "Berola da silva"; /////////// isso é um teste, apagar depois
  if (nome) {
    res.json({ status: 'ok', nome });
  } else {
    res.json({ status: 'nao_logado' });
  }
}


// Funções do controller
exports.listarPessoas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pessoa ORDER BY cpf');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.verificarEmail = async (req, res) => {
  const { email } = req.body;

  const sql = 'SELECT nome_pessoa FROM pessoa WHERE email_pessoa = $1';

  console.log('rota verificarEmail:', sql, email);

  try {
    const result = await db.query(sql, [email]);

    if (result.rows.length > 0) {
      return res.json({ status: 'existe', nome: result.rows[0].nome_pessoa });
    }

    res.json({ status: 'nao_encontrado' });
  } catch (err) {
    console.error('Erro em verificarEmail:', err);
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
};


// Verificar senha
exports.verificarSenha = async (req, res) => {
  const { email, senha } = req.body;

  const sqlPessoa = `
    SELECT cpf, nome_pessoa 
    FROM pessoa 
    WHERE email_pessoa = $1 AND senha_pessoa = $2
  `;

  console.log('Rota verificarSenha:', sqlPessoa, email, senha);

  try {
    const resultPessoa = await db.query(sqlPessoa, [email, senha]);

    if (resultPessoa.rows.length === 0) {
      return res.json({ status: 'senha_incorreta' });
    }

    const { cpf, nome_pessoa } = resultPessoa.rows[0];
    console.log('Usuário encontrado:', resultPessoa.rows[0]);

    // 3. Define cookie
    res.cookie('usuarioLogado', nome_pessoa, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
    });

    console.log("Cookie 'usuarioLogado' definido com sucesso");

    // 4. Retorna dados para o frontend
    return res.json({
      status: 'ok',
      nome: nome_pessoa,
      cpf
    });

  } catch (err) {
    console.error('Erro ao verificar senha:', err);
    return res.status(500).json({ status: 'erro', mensagem: err.message });
  }
}


// Logout
exports.logout = (req, res) => {
  res.clearCookie('usuarioLogado', {
    sameSite: 'None',
    secure: true,
    httpOnly: true,
    path: '/',
  });
  console.log("Cookie 'usuarioLogado' removido com sucesso");
  res.json({ status: 'deslogado' });
}


exports.criarPessoa = async (req, res) => {
  try {
    const { cpf, nome_pessoa, email_pessoa, senha_pessoa } = req.body;

    if (!cpf || !nome_pessoa || !email_pessoa || !senha_pessoa) {
      return res.status(400).json({
        error: 'CPF, Nome, email e senha são obrigatórios'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pessoa)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    const result = await db.query(
      'INSERT INTO pessoa (cpf, nome_pessoa, email_pessoa, senha_pessoa) VALUES ($1, $2, $3, $4) RETURNING *',
      [cpf, nome_pessoa, email_pessoa, senha_pessoa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);

    if (error.code === '23505' && error.constraint === 'pessoa_email_pessoa_key') {
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.obterPessoa = async (req, res) => {
  try {
    const cpf = req.params.id;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF deve ser informado' });
    }

    const result = await db.query(
      'SELECT * FROM pessoa WHERE cpf = $1',
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


// Buscar pessoa por email
exports.obterPessoaPorEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const result = await db.query(
      'SELECT * FROM pessoa WHERE email_pessoa = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa por email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


// Atualizar apenas a senha
exports.atualizarSenha = async (req, res) => {
  try {
    const cpf = req.params.id;
    const { senha_atual, nova_senha } = req.body;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF deve ser informado' });
    }

    if (!senha_atual || !nova_senha) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    const personResult = await db.query(
      'SELECT * FROM pessoa WHERE cpf = $1',
      [cpf]
    );

    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    const person = personResult.rows[0];

    if (person.senha_pessoa !== senha_atual) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const updateResult = await db.query(
      'UPDATE pessoa SET senha_pessoa = $1 WHERE cpf = $2 RETURNING cpf, nome_pessoa, email_pessoa',
      [nova_senha, cpf]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
