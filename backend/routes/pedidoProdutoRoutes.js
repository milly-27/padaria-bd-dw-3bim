const express = require('express');
const router = express.Router();
const pedidoProdutoController = require('./../controllers/pedidoProdutoController');

// CRUD de PedidoProduto
router.get('/abrirCrudPedidoProduto', pedidoProdutoController.abrirCrudPedidoProduto);
router.get('/', pedidoProdutoController.listar);
router.post('/', pedidoProdutoController.criar);
router.get('/:id_pedido/:id_produto', pedidoProdutoController.obter);
router.put('/:id_pedido/:id_produto', pedidoProdutoController.atualizar);
router.delete('/:id_pedido/:id_produto', pedidoProdutoController.deletar);

module.exports = router;
