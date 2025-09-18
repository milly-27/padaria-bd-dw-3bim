const { query } = require('../database');
const bcrypt = require('bcrypt'); // Adicione esta dependência: npm install bcrypt

// Função de login com hash de senha
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const result = await query(
      'SELECT cpf, nome_pessoa, email_pessoa, senha_pessoa FROM pessoa WHERE email_pessoa = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const usuario = result.rows[0];
    
    // Verificação de senha com hash (recomendado)
    const senhaValida = await bcrypt.compare(senha, usuario.senha_pessoa);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Configurar cookie com mais segurança
    res.cookie('usuarioLogado', usuario.nome_pessoa, {
      sameSite: 'Lax',
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      secure: process.env.NODE_ENV === 'production' // HTTPS em produção
    });

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      usuario: {
        id_pessoa: usuario.cpf,
        nome_pessoa: usuario.nome_pessoa,
        email_pessoa: usuario.email_pessoa,
        cpf_pessoa: usuario.cpf
      }
    });
    
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função para verificar se está logado
exports.verificarLogin = (req, res) => {
  const nomeUsuario = req.cookies.usuarioLogado;
  
  if (nomeUsuario) {
    return res.json({ logado: true, nome: nomeUsuario });
  } else {
    return res.json({ logado: false });
  }
};

// Função de logout
exports.logout = (req, res) => {
  res.clearCookie('usuarioLogado', {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax'
  });
  return res.json({ success: true, message: 'Logout realizado com sucesso' });
};