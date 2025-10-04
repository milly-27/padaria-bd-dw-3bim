document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cadastroForm");
    const messageContainer = document.getElementById("messageContainer");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        messageContainer.innerHTML = "";

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const cpf = document.getElementById("cpf").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        // validação de senha
        if (senha !== confirmarSenha) {
            messageContainer.innerHTML = `<div class="error-message">As senhas não coincidem!</div>`;
            return;
        }

        try {
            // ajuste da porta para 3001 (onde seu backend está rodando)
            const response = await fetch("http://localhost:3001/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, cpf, senha })
            });

            const result = await response.json();

            if (response.ok) {
                messageContainer.innerHTML = `<div class="success-message">${result.message}</div>`;
                form.reset();
            } else {
                messageContainer.innerHTML = `<div class="error-message">${result.message}</div>`;
            }
        } catch (err) {
            console.error("Erro no frontend:", err);
            messageContainer.innerHTML = `<div class="error-message">Erro ao conectar com o servidor.</div>`;
        }
    });
});
