const { query } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    const { nome_pessoa, email_pessoa, cpf, senha_pessoa } = req.body;

    try {
        // Verificar se já existe uma pessoa com o mesmo email ou CPF
        const existingPerson = await query(
            "SELECT * FROM pessoa WHERE email_pessoa = $1 OR cpf = $2",
            [email_pessoa, cpf]
        );

        if (existingPerson.rows.length > 0) {
            return res.status(400).json({ message: "Usuário já cadastrado com este email ou CPF!" });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha_pessoa, 10);

        // Inserir na tabela pessoa
        const newPerson = await query(
            "INSERT INTO pessoa (cpf, nome_pessoa, email_pessoa, senha_pessoa) VALUES ($1, $2, $3, $4) RETURNING cpf, nome_pessoa, email_pessoa",
            [cpf, nome_pessoa, email_pessoa, hashedPassword]
        );

        // Inserir na tabela cliente (assumindo que todo cadastro é um cliente)
        await query(
            "INSERT INTO cliente (cpf) VALUES ($1)",
            [cpf]
        );

        return res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: newPerson.rows[0] });
    } catch (error) {
        console.error("Erro no registro:", error);
        return res.status(500).json({ message: "Erro interno do servidor ao registrar usuário." });
    }
};

exports.login = async (req, res) => {
    const { email_pessoa, senha_pessoa } = req.body;

    try {
        // Buscar pessoa pelo email
        const person = await query(
            "SELECT * FROM pessoa WHERE email_pessoa = $1",
            [email_pessoa]
        );

        if (person.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }

        const user = person.rows[0];

        // Comparar senhas
        const match = await bcrypt.compare(senha_pessoa, user.senha_pessoa);
        if (!match) {
            return res.status(401).json({ message: "Email ou senha incorretos!" });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { cpf: user.cpf, email: user.email_pessoa, nome: user.nome_pessoa },
            process.env.JWT_SECRET || "secreta", // Usar variável de ambiente para a chave secreta
            { expiresIn: "1h" }
        );

        // Retornar sucesso e dados do usuário (sem a senha)
        return res.status(200).json({ 
            success: true, 
            message: "Login bem-sucedido!", 
            token, 
            usuario: { 
                cpf: user.cpf, 
                nome_pessoa: user.nome_pessoa, 
                email_pessoa: user.email_pessoa 
            }
        });
    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ message: "Erro interno do servidor ao fazer login." });
    }
};

exports.verificarLogin = async (req, res) => {
    try {
        const token = req.cookies.token; // Assumindo que o token está nos cookies
        if (!token) {
            return res.json({ logado: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreta");
        const user = await query("SELECT cpf, nome_pessoa, email_pessoa FROM pessoa WHERE cpf = $1", [decoded.cpf]);

        if (user.rows.length === 0) {
            return res.json({ logado: false });
        }

        res.json({ logado: true, usuario: user.rows[0] });
    } catch (error) {
        console.error("Erro ao verificar login:", error);
        res.json({ logado: false });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout realizado com sucesso!" });
};
