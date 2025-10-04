
const { query } = require("../database");

exports.cadastrar = async (req, res) => {
  const { nome, email, cpf, senha } = req.body;

  // Validação básica dos campos
  if (!nome || !email || !cpf || !senha) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const checkQuery = "SELECT * FROM pessoa WHERE cpf = $1 OR email_pessoa = $2";
    const result = await query(checkQuery, [cpf, email]);

    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Pessoa já cadastrada, faça login." });
    }

    const insertQuery =
      "INSERT INTO pessoa (cpf, nome_pessoa, email_pessoa, senha_pessoa) VALUES ($1, $2, $3, $4) RETURNING *";
    const newPerson = await query(insertQuery, [cpf, nome, email, senha]);

    return res.status(201).json({ message: "Cadastro realizado com sucesso!", pessoa: newPerson.rows[0] });
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos ou inválidos',
        details: error.message
      });
    }
    return res.status(500).json({ message: "Erro interno do servidor ao cadastrar." });
  }
};

