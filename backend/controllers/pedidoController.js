
const db = require("../database.js");
const path = require("path");

// Abrir página de pedidos
exports.abrirCrudPedido = (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/pedido/pedido.html"));
};

// Listar todos os pedidos
exports.listarPedidos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id_pedido, p.data_pedido, p.valor_total, p.cpf, pe.nome_pessoa AS cliente
      FROM pedido p
      JOIN pessoa pe ON p.cpf = pe.cpf
      ORDER BY p.id_pedido DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Criar novo pedido
exports.criarPedido = async (req, res) => {
  try {
    const { cpf, data_pedido, valor_total, itens } = req.body;

    if (!cpf || !data_pedido || !valor_total || !Array.isArray(itens)) {
      return res.status(400).json({ error: "Dados do pedido incompletos" });
    }

    // Cria pedido
    const pedidoResult = await db.query(
      "INSERT INTO pedido (cpf, data_pedido, valor_total) VALUES ($1, $2, $3) RETURNING id_pedido",
      [cpf, data_pedido, valor_total]
    );

    const id_pedido = pedidoResult.rows[0].id_pedido;

    // Insere itens na tabela pedidoproduto
    for (let item of itens) {
      await db.query(
        "INSERT INTO pedidoproduto (id_produto, id_pedido, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)",
        [item.id_produto, id_pedido, item.quantidade, item.preco_unitario]
      );
    }

    res.status(201).json({ id_pedido });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Obter pedido por ID
exports.obterPedido = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id_pedido);

    const pedidoResult = await db.query(
      "SELECT p.*, pe.nome_pessoa AS cliente_nome FROM pedido p JOIN pessoa pe ON p.cpf = pe.cpf WHERE p.id_pedido = $1",
      [id_pedido]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    const itensResult = await db.query(`
      SELECT pp.id_produto, pr.nome_produto, pp.quantidade, pp.preco_unitario
      FROM pedidoproduto pp
      JOIN produto pr ON pp.id_produto = pr.id_produto
      WHERE pp.id_pedido = $1
    `, [id_pedido]);

    res.json({
      ...pedidoResult.rows[0],
      itens: itensResult.rows
    });
  } catch (error) {
    console.error("Erro ao obter pedido:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Atualizar pedido (só valor_total e itens, não troca cliente/data)
exports.atualizarPedido = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id_pedido);
    const { valor_total, itens } = req.body;

    await db.query(
      "UPDATE pedido SET valor_total = $1 WHERE id_pedido = $2",
      [valor_total, id_pedido]
    );

    // Remove itens antigos
    await db.query("DELETE FROM pedidoproduto WHERE id_pedido = $1", [id_pedido]);

    // Insere itens novos
    for (let item of itens) {
      await db.query(
        "INSERT INTO pedidoproduto (id_produto, id_pedido, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)",
        [item.id_produto, id_pedido, item.quantidade, item.preco_unitario]
      );
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Deletar pedido
exports.deletarPedido = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id_pedido);

    const result = await db.query("DELETE FROM pedido WHERE id_pedido = $1 RETURNING *", [id_pedido]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};


