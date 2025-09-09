const db = require('../database.js');
const path = require('path');

// Abrir página de categoria
exports.abrirCrudCategoria = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/categoria/categoria.html'));
};

// Listar categorias
exports.listarCategorias = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM categoria ORDER BY id_categoria'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar categoria
exports.criarCategoria = async (req, res) => {
  try {
    const { nome_categoria } = req.body;

    if (!nome_categoria) {
      return res.status(400).json({
        error: 'Nome da categoria é obrigatório'
      });
    }

    const result = await db.query(
      'INSERT INTO categoria (nome_categoria) VALUES ($1) RETURNING *',
      [nome_categoria]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter categoria por ID
exports.obterCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await db.query(
      'SELECT * FROM categoria WHERE id_categoria = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar categoria
exports.atualizarCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_categoria } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const existingResult = await db.query(
      'SELECT * FROM categoria WHERE id_categoria = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const updatedNome = nome_categoria || existingResult.rows[0].nome_categoria;

    const updateResult = await db.query(
      'UPDATE categoria SET nome_categoria = $1 WHERE id_categoria = $2 RETURNING *',
      [updatedNome, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar categoria
exports.deletarCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const existingResult = await db.query(
      'SELECT * FROM categoria WHERE id_categoria = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await db.query('DELETE FROM categoria WHERE id_categoria = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar categoria que possui produtos vinculados'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
