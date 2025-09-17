const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const messageContainer = document.getElementById('messageContainer');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já está logado
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        window.location.href = '../menu.html';
        return;
    }
    
    emailInput.focus();
});

loginForm.addEventListener('submit', fazerLogin);

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
}

// Função para fazer login
async function fazerLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    
    // Validação básica
    if (!email || !senha) {
        mostrarMensagem('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensagem('Por favor, digite um email válido!', 'error');
        return;
    }
    
    try {
        mostrarMensagem('Verificando credenciais...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login bem-sucedido
            mostrarMensagem('Login realizado com sucesso!', 'success');
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify({
                id: data.usuario.id_pessoa,
                nome: data.usuario.nome_pessoa,
                email: data.usuario.email_pessoa,
                cpf: data.usuario.cpf_pessoa
            }));
            
            // Redirecionar para o menu principal
            setTimeout(() => {
                window.location.href = '../menu.html';
            }, 1000);
            
        } else if (response.status === 404) {
            // Usuário não encontrado - redirecionar para cadastro
            mostrarMensagem('Usuário não encontrado. Redirecionando para cadastro...', 'info');
            setTimeout(() => {
                window.location.href = 'cadastro.html';
            }, 2000);
            
        } else if (response.status === 401) {
            // Senha incorreta
            mostrarMensagem('Email ou senha incorretos!', 'error');
            senhaInput.focus();
            senhaInput.select();
            
        } else {
            // Outros erros
            mostrarMensagem(data.error || 'Erro ao fazer login. Tente novamente.', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        mostrarMensagem('Erro de conexão com o servidor. Tente novamente.', 'error');
    }
}

// Função para limpar formulário
function limparFormulario() {
    emailInput.value = '';
    senhaInput.value = '';
    emailInput.focus();
}

// Adicionar enter para submeter o formulário
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        senhaInput.focus();
    }
});

senhaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fazerLogin(e);
    }
});
