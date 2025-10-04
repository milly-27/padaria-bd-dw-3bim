const express = require("express");
const router = express.Router();
const cadastroController = require("../controllers/cadastroController");

// rota POST para cadastro
router.post("/", cadastroController.cadastrar);

module.exports = router;
