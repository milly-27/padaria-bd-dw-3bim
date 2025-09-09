const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// ===================== PRODUTO =====================
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProduto);
router.post('/', produtoController.criarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.excluirProduto);

// ===================== CATEGORIA =====================
router.get('/categorias/listar', produtoController.listarCategorias);
router.post('/categorias', produtoController.criarCategoria);

module.exports = router;
