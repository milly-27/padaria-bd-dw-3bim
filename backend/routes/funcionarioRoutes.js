const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');

// ===================== FUNCIONÁRIO =====================
router.get('/', funcionarioController.listarFuncionarios);
router.get('/:cpf', funcionarioController.obterFuncionario);
router.post('/', funcionarioController.criarFuncionario);
router.put('/:cpf', funcionarioController.atualizarFuncionario);
router.delete('/:cpf', funcionarioController.excluirFuncionario);

// ===================== CARGO =====================
router.get('/cargos/listar', funcionarioController.listarCargos);
router.post('/cargos', funcionarioController.criarCargo);

module.exports = router;
