const API_BASE_URL = 'http://localhost:3001';

// Função para redirecionar para a tela de login
function redirecionarLogin() {
    window.location.href = 'login/login.html';
}

// Função para fazer logout
function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        // Limpar dados da sessão
        sessionStorage.removeItem('usuarioLogado');
        
        // Esconder informações do usuário e mostrar botão de login
        document.getElementById('userInfo').classList.add('hidden');
        document.getElementById('btnLogin').classList.remove('hidden');
        document.getElementById('loginMessage').classList.add('hidden');
        
        // Opcional: redirecionar para a página de login
        // window.location.href = 'login.html';
        
        alert('Logout realizado com sucesso!');
    }
}

// Função para verificar se o usuário está logado
function verificarLogin() {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    
    if (usuarioLogado) {
        const userData = JSON.parse(usuarioLogado);
        mostrarUsuarioLogado(userData);
    }
}

// Função para mostrar informações do usuário logado
function mostrarUsuarioLogado(userData) {
    const btnLogin = document.getElementById('btnLogin');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const loginMessage = document.getElementById('loginMessage');
    
    // Esconder botão de login
    btnLogin.classList.add('hidden');
    
    // Mostrar informações do usuário
    userName.textContent = userData.nome;
    userInfo.classList.remove('hidden');
    
    // Mostrar mensagem de boas-vindas
    loginMessage.classList.remove('hidden');
}

// Verificar login ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    verificarLogin();
});

// Função para simular login (para teste)
function simularLogin() {
    const userData = {
        cpf: '12345678901',
        nome: 'Berola da Silva',
        email: 'berola@gmail.com'
    };
    
    sessionStorage.setItem('usuarioLogado', JSON.stringify(userData));
    mostrarUsuarioLogado(userData);
}

// Adicionar evento para testar o login (remover em produção)
document.addEventListener('keydown', function(e) {
    // Pressionar Ctrl+L para simular login (apenas para teste)
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        simularLogin();
    }
});

// Funções originais mantidas para compatibilidade
function handleUserAction(action) {
    if (action === "gerenciar-conta") {
        alert("Redirecionando para a página de Gerenciar Conta...");
        // window.location.href = "/gerenciar-conta";
    } else if (action === "sair") {
        logout();
    }
}

// Função de logout alternativa (mantida para compatibilidade)
function logout2() {
    logout();
}

// Função original nomeUsuario (mantida para compatibilidade)
function nomeUsuario() {
    // Esta função foi substituída pelo sistema de verificarLogin()
    verificarLogin();
}

// Função para verificação de usuário autorizado (placeholder)
async function usuarioAutorizado() {
    // Implementar conforme necessidade da API
    console.log('Função usuarioAutorizado() - implementar conforme API');
}