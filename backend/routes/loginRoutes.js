const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Rota para login
router.post('/login', loginController.login);

// Rota para verificar se está logado
router.get('/verificar-login', loginController.verificarLogin);

// Rota para logout
router.post('/logout', loginController.logout);

module.exports = router;