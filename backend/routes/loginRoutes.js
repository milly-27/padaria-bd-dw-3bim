const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// --- Rotas de Autenticação ---
// Rota principal para realizar o login
router.post('/login', loginController.login);

// Rota para verificar se o usuário já tem uma sessão ativa (cookie)
router.get('/verificaSeUsuarioEstaLogado', loginController.verificaSeUsuarioEstaLogado);

// --- Rotas de CRUD para 'pessoa' ---
router.get('/', loginController.listarPessoas);
router.post('/', loginController.criarPessoa);
router.get('/:id', loginController.obterPessoa);
// router.put('/:id', loginController.atualizarPessoa);
// router.delete('/:id', loginController.deletarPessoa);

module.exports = router;
