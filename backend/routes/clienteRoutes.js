const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// ===================== CLIENTE =====================
router.get('/', clienteController.listarClientes);
router.get('/:cpf', clienteController.obterCliente);
router.post('/', clienteController.criarCliente);
router.delete('/:cpf', clienteController.excluirCliente);

module.exports = router;
