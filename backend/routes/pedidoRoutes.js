const express = require('express');
const router = express.Router();
const pedidoController = require('./../controllers/pedidoController');

// CRUD de Pedidos

router.get('/abrirCrudPedido', pedidoController.abrirCrudPedido);
router.get('/', pedidoController.listarPedidos);
router.post('/', pedidoController.criarPedido);
router.get('/:id_pedido', pedidoController.obterPedido);
router.put('/:id_pedido', pedidoController.atualizarPedido);
router.delete('/:id_pedido', pedidoController.deletarPedido);

module.exports = router;
