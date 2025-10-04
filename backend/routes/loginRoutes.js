const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

// Rota de registro
router.post("/register", loginController.register);

// Rota de login
router.post("/login", loginController.login);

// Rota para verificar status de login
router.get("/verificar-login", loginController.verificarLogin);

// Rota de logout
router.post("/logout", loginController.logout);

module.exports = router;

