//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudPedidoproduto = (req, res) => {
  console.log('pedidoprodutoController - Rota /abrirCrudPedidoproduto - abrir o crudPedidoproduto');
  res.sendFile(path.join(__dirname, '../../frontend/pedidoproduto/pedidoproduto.html'));
}

exports.listarPedidoprodutos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pedidoproduto ORDER BY id_pedido');
    console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidoprodutos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


exports.criarPedidoproduto = async (req, res) => {
  //  console.log('Criando pedidoproduto com dados:', req.body);
  try {
    const { id_pedido, id_produto, quantidade, preco_unitario } = req.body;


    const result = await query(
      'INSERT INTO pedidoproduto (id_pedido, id_produto, quantidade, preco_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_pedido, id_produto, quantidade, preco_unitario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedidoproduto:', error);



    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPedidoproduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // console.log("estou no obter pedidoproduto id="+ id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM pedidoproduto WHERE id_pedido = $1',
      [id]
    );

    //console.log(result)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedidoproduto não encontrado' });
    }

    res.json(result.rows); //retorna todos os itens do pedido
  } catch (error) {
    console.error('Erro ao obter pedidoproduto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPedidoproduto = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id);
    const { id_produto, quantidade, preco_unitario } = req.body;


    // Verifica se a pedidoproduto existe
    const existingPersonResult = await query(
      'SELECT * FROM pedidoproduto WHERE id_pedido = $1 AND id_produto = $2',
      [id_pedido, id_produto]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedidoproduto não encontrada' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      quantidade: quantidade !== undefined ? quantidade : currentPerson.quantidade,
      preco_unitario: preco_unitario !== undefined ? preco_unitario : currentPerson.preco_unitario
    };

    // Atualiza a pedidoproduto
    const updateResult = await query(
      'UPDATE pedidoproduto SET quantidade = $1, preco_unitario = $2 WHERE id_pedido = $3 AND id_produto = $4 RETURNING *',
      [updatedFields.quantidade, updatedFields.preco_unitario, id_pedido, id_produto]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedidoproduto:', error);


    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPedidoproduto = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id);
    const id_produto = parseInt(req.query.id_produto || req.body.id_produto);
    
    // Verifica se a pedidoproduto existe
    const existingPersonResult = await query(
      'SELECT * FROM pedidoproduto WHERE id_pedido = $1 AND id_produto = $2',
      [id_pedido, id_produto]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedidoproduto não encontrada' });
    }

    // Deleta a pedidoproduto (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM pedidoproduto WHERE id_pedido = $1 AND id_produto = $2',
      [id_pedido, id_produto]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pedidoproduto:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pedidoproduto com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}