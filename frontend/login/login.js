const API_BASE_URL = 'http://localhost:3001';

console.log('=== SCRIPT CARREGADO ===');
console.log('URL da API:', API_BASE_URL);

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const messageContainer = document.getElementById('messageContainer');

console.log('Elementos encontrados:', {
    loginForm: !!loginForm,
    emailInput: !!emailInput,
    senhaInput: !!senhaInput,
    messageContainer: !!messageContainer
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM CARREGADO ===');
    verificarSeEstaLogado();
    if (emailInput) {
        emailInput.focus();
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', fazerLogin);
}

// Função para verificar se o usuário já está logado
async function verificarSeEstaLogado() {
    console.log('=== VERIFICANDO SE ESTÁ LOGADO ===');
    try {
        const url = `${API_BASE_URL}/verificar-login`;
        console.log('Tentando acessar:', url);
        
        const response = await fetch(url, {       
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('Status verificar login:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Dados verificar login:', data);
            
            if (data.logado) {
                mostrarMensagem('Você já está logado! Redirecionando...', 'success');
                setTimeout(() => {
                    window.location.href = '../menu.html';
                }, 1000);
                return;
            }
        }
    } catch (error) {
        console.error('=== ERRO AO VERIFICAR LOGIN ===');
        console.error('Erro:', error);
        console.error('Nome do erro:', error.name);
        console.error('Mensagem:', error.message);
        // Continua normal se não conseguir verificar
    }
}

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    console.log('Mostrando mensagem:', texto, 'Tipo:', tipo);
    
    if (messageContainer) {
        messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
        
        // Auto-remover mensagem após 5 segundos
        setTimeout(() => {
            if (messageContainer.innerHTML.includes(texto)) {
                messageContainer.innerHTML = '';
            }
        }, 5000);
    } else {
        console.error('messageContainer não encontrado!');
        alert(texto); // Fallback
    }
}

// Função para fazer login
async function fazerLogin(event) {
    event.preventDefault();
    console.log('=== INICIANDO LOGIN ===');
    
    const email = emailInput ? emailInput.value.trim() : '';
    const senha = senhaInput ? senhaInput.value.trim() : '';

    console.log('Dados do login:', { email, senha: senha ? '[SENHA INFORMADA]' : '[SEM SENHA]' });
    console.log('URL da API:', API_BASE_URL);

    // Validação básica
    if (!email || !senha) {
        console.log('Validação falhou: campos vazios');
        mostrarMensagem('Por favor, preencha todos os campos!', 'error');
        return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('Validação falhou: email inválido');
        mostrarMensagem('Por favor, digite um email válido!', 'error');
        return;
    }

    try {
        mostrarMensagem('Verificando credenciais...', 'info');
        
        const url = `${API_BASE_URL}/login`;
        console.log('URL de login:', url);
        console.log('Iniciando requisição fetch...');
        
        const requestData = { email, senha };
        console.log('Dados da requisição:', { ...requestData, senha: '[OCULTA]' });
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
        });

        console.log('=== RESPOSTA RECEBIDA ===');
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        console.log('Headers:', response.headers);
        
        if (!response.ok) {
            console.log('Response não OK, tentando ler como JSON...');
        }
        
        const data = await response.json();
        console.log('Dados da resposta:', data);

        if (response.ok && data.success) {
            console.log('=== LOGIN SUCESSO ===');
            // Login bem-sucedido
            mostrarMensagem('Login realizado com sucesso!', 'success');
            
            // Salvar dados no localStorage
            const userData = {
                id: data.usuario.id_pessoa,
                nome: data.usuario.nome_pessoa,
                email: data.usuario.email_pessoa,
                cpf: data.usuario.cpf_pessoa
            };
            
            console.log('Salvando dados no localStorage:', userData);
            localStorage.setItem('usuarioLogado', JSON.stringify(userData));

            // Redirecionar após 1.5 segundos
            setTimeout(() => {
                console.log('Redirecionando para menu...');
                window.location.href = '../menu.html';
            }, 1500);
            
        } else if (response.status === 404) {
            console.log('=== USUÁRIO NÃO ENCONTRADO ===');
            mostrarMensagem('Usuário não encontrado. Deseja se cadastrar?', 'warning');
            setTimeout(() => {
                if (confirm('Usuário não encontrado. Deseja ir para a página de cadastro?')) {
                    window.location.href = 'cadastro.html';
                }
            }, 2000);
            
        } else if (response.status === 401) {
            console.log('=== SENHA INCORRETA ===');
            mostrarMensagem('Email ou senha incorretos!', 'error');
            if (senhaInput) {
                senhaInput.focus();
                senhaInput.select();
            }
            
        } else {
            console.log('=== OUTRO ERRO ===');
            mostrarMensagem(data.error || 'Erro ao fazer login. Tente novamente.', 'error');
        }
        
    } catch (error) {
        console.error('=== ERRO DE CONEXÃO ===');
        console.error('Erro completo:', error);
        console.error('Tipo do erro:', typeof error);
        console.error('Nome do erro:', error.name);
        console.error('Mensagem do erro:', error.message);
        console.error('Stack:', error.stack);
        
        // Verificar se é erro de rede
        if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
            mostrarMensagem('Servidor não está respondendo. Verifique se está rodando na porta 3001.', 'error');
        } else if (error.name === 'SyntaxError') {
            mostrarMensagem('Erro ao processar resposta do servidor.', 'error');
        } else {
            mostrarMensagem('Erro de conexão com o servidor. Tente novamente.', 'error');
        }
    }
}

// Navegação com Enter
if (emailInput) {
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (senhaInput) {
                senhaInput.focus();
            }
        }
    });
}

if (senhaInput) {
    senhaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fazerLogin(e);
        }
    });
}

// Funções utilitárias
function limparFormulario() {
    if (emailInput) emailInput.value = '';
    if (senhaInput) senhaInput.value = '';
    if (emailInput) emailInput.focus();
}

function irParaCadastro() {
    window.location.href = 'cadastro.html';
}

function voltarAoMenu() {
    window.location.href = '../menu.html';
}

console.log('=== SCRIPT FINALIZADO ===');