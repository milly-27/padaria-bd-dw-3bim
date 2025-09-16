const db = require('../database.js');

// Função de Login (já estava correta)
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ status: 'erro', mensagem: 'Email e senha são obrigatórios' });
  }

  try {
    const resultadoPessoa = await db.query(
      'SELECT cpf, nome_pessoa, senha_pessoa FROM pessoa WHERE email_pessoa = $1',
      [email]
    );

    if (resultadoPessoa.rows.length === 0) {
      return res.json({ status: 'nao_encontrado' });
    }

    const pessoaEncontrada = resultadoPessoa.rows[0];

    if (pessoaEncontrada.senha_pessoa !== senha) {
      return res.json({ status: 'senha_incorreta' });
    }

    res.cookie('usuarioLogado', pessoaEncontrada.nome_pessoa, {
      sameSite: 'Lax',
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    } );
    
    return res.json({
      status: 'ok',
      nome: pessoaEncontrada.nome_pessoa,
      cpf: pessoaEncontrada.cpf
    });

  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ status: 'erro', mensagem: 'Erro no servidor' });
  }
};

// ================================================================
// FUNÇÕES QUE ESTAVAM FALTANDO - ADICIONE A PARTIR DAQUI
// ================================================================

// Função para verificar se o usuário tem um cookie de sessão
exports.verificaSeUsuarioEstaLogado = (req, res) => {
  const nome = req.cookies.usuarioLogado;
  if (nome) {
    res.json({ status: 'ok', nome });
  } else {
    res.json({ status: 'nao_logado' });
  }
};

// Função para listar todas as pessoas
exports.listarPessoas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pessoa ORDER BY cpf');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função para criar uma nova pessoa
exports.criarPessoa = async (req, res) => {
  try {
    const { cpf, nome_pessoa, email_pessoa, senha_pessoa } = req.body;

    if (!cpf || !nome_pessoa || !email_pessoa || !senha_pessoa) {
      return res.status(400).json({ error: 'CPF, Nome, email e senha são obrigatórios' });
    }

    const result = await db.query(
      'INSERT INTO pessoa (cpf, nome_pessoa, email_pessoa, senha_pessoa) VALUES ($1, $2, $3, $4) RETURNING *',
      [cpf, nome_pessoa, email_pessoa, senha_pessoa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função para obter uma pessoa pelo ID (CPF)
exports.obterPessoa = async (req, res) => {
  try {
    const cpf = req.params.id;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF deve ser informado' });
    }

    const result = await db.query('SELECT * FROM pessoa WHERE cpf = $1', [cpf]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
