const express = require('express');
const router = express.Router();
const pedidoprodutoController = require('./../controllers/pedidoprodutoController');

// CRUD de Pedidoprodutos

router.get('/abrirCrudPedidoproduto', pedidoprodutoController.abrirCrudPedidoproduto);
router.get('/', pedidoprodutoController.listarPedidoprodutos);
router.post('/', pedidoprodutoController.criarPedidoproduto);
router.get('/:id', pedidoprodutoController.obterPedidoproduto);
router.put('/:id', pedidoprodutoController.atualizarPedidoproduto);
router.delete('/:id', pedidoprodutoController.deletarPedidoproduto);

module.exports = router;