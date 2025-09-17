const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const cadastroForm = document.getElementById('cadastroForm');
const cpfInput = document.getElementById('cpf');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const messageContainer = document.getElementById('messageContainer');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já está logado
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        window.location.href = '../menu.html';
        return;
    }
    
    cpfInput.focus();
});

cadastroForm.addEventListener('submit', fazerCadastro);

// Máscara para CPF
cpfInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
});

// Validação em tempo real
emailInput.addEventListener('blur', validarEmail);
senhaInput.addEventListener('input', validarSenha);
confirmarSenhaInput.addEventListener('input', validarConfirmacaoSenha);
cpfInput.addEventListener('blur', validarCPF);

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
}

// Função para validar CPF
function validarCPF() {
    const cpf = cpfInput.value.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
        adicionarIndicadorValidacao(cpfInput, 'CPF deve ter 11 dígitos', 'error');
        return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
        adicionarIndicadorValidacao(cpfInput, 'CPF inválido', 'error');
        return false;
    }
    
    // Validação do algoritmo do CPF
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) {
        adicionarIndicadorValidacao(cpfInput, 'CPF inválido', 'error');
        return false;
    }
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) {
        adicionarIndicadorValidacao(cpfInput, 'CPF inválido', 'error');
        return false;
    }
    
    adicionarIndicadorValidacao(cpfInput, 'CPF válido', 'success');
    return true;
}

// Função para validar email
function validarEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        adicionarIndicadorValidacao(emailInput, 'Email inválido', 'error');
        return false;
    }
    
    adicionarIndicadorValidacao(emailInput, 'Email válido', 'success');
    return true;
}

// Função para validar senha
function validarSenha() {
    const senha = senhaInput.value;
    
    if (senha.length < 6) {
        adicionarIndicadorValidacao(senhaInput, 'Senha deve ter pelo menos 6 caracteres', 'error');
        return false;
    }
    
    adicionarIndicadorValidacao(senhaInput, 'Senha válida', 'success');
    
    // Revalidar confirmação se já foi preenchida
    if (confirmarSenhaInput.value) {
        validarConfirmacaoSenha();
    }
    
    return true;
}

// Função para validar confirmação de senha
function validarConfirmacaoSenha() {
    const senha = senhaInput.value;
    const confirmacao = confirmarSenhaInput.value;
    
    if (senha !== confirmacao) {
        adicionarIndicadorValidacao(confirmarSenhaInput, 'Senhas não coincidem', 'error');
        return false;
    }
    
    if (confirmacao.length >= 6) {
        adicionarIndicadorValidacao(confirmarSenhaInput, 'Senhas coincidem', 'success');
        return true;
    }
    
    return false;
}

// Função para adicionar indicador de validação
function adicionarIndicadorValidacao(input, mensagem, tipo) {
    // Remover indicador anterior
    const indicadorAnterior = input.parentNode.querySelector('.validation-indicator');
    if (indicadorAnterior) {
        indicadorAnterior.remove();
    }
    
    // Adicionar classe ao input
    input.classList.remove('success', 'error');
    input.classList.add(tipo);
    
    // Criar novo indicador
    const indicador = document.createElement('div');
    indicador.className = `validation-indicator ${tipo}`;
    indicador.textContent = mensagem;
    input.parentNode.appendChild(indicador);
}

// Função para fazer cadastro
async function fazerCadastro(event) {
    event.preventDefault();
    
    const cpf = cpfInput.value.replace(/\D/g, '');
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;
    
    // Validações
    if (!validarCPF()) {
        mostrarMensagem('Por favor, digite um CPF válido!', 'error');
        cpfInput.focus();
        return;
    }
    
    if (!nome) {
        mostrarMensagem('Por favor, digite seu nome completo!', 'error');
        nomeInput.focus();
        return;
    }
    
    if (!validarEmail()) {
        mostrarMensagem('Por favor, digite um email válido!', 'error');
        emailInput.focus();
        return;
    }
    
    if (!validarSenha()) {
        mostrarMensagem('A senha deve ter pelo menos 6 caracteres!', 'error');
        senhaInput.focus();
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem!', 'error');
        confirmarSenhaInput.focus();
        return;
    }
    
    try {
        mostrarMensagem('Verificando se o email já existe...', 'info');
        
        // Verificar se email já existe
        const verificarResponse = await fetch(`${API_BASE_URL}/auth/verificar-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        if (verificarResponse.status === 409) {
            mostrarMensagem('Este email já está cadastrado! Tente fazer login.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        mostrarMensagem('Criando sua conta...', 'info');
        
        // Criar conta
        const response = await fetch(`${API_BASE_URL}/pessoas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cpf_pessoa: cpf,
                nome_pessoa: nome,
                email_pessoa: email,
                senha_pessoa: senha
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Cadastro bem-sucedido
            mostrarMensagem('Conta criada com sucesso! Redirecionando para login...', 'success');
            
            // Limpar formulário
            cadastroForm.reset();
            
            // Redirecionar para login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            // Erro no cadastro
            if (response.status === 400 && data.error.includes('Email')) {
                mostrarMensagem('Este email já está em uso!', 'error');
                emailInput.focus();
            } else if (response.status === 400 && data.error.includes('CPF')) {
                mostrarMensagem('Este CPF já está em uso!', 'error');
                cpfInput.focus();
            } else {
                mostrarMensagem(data.error || 'Erro ao criar conta. Tente novamente.', 'error');
            }
        }
        
    } catch (error) {
        console.error('Erro ao fazer cadastro:', error);
        mostrarMensagem('Erro de conexão com o servidor. Tente novamente.', 'error');
    }
}

// Navegação entre campos com Enter
cpfInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        nomeInput.focus();
    }
});

nomeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        emailInput.focus();
    }
});

emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        senhaInput.focus();
    }
});

senhaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmarSenhaInput.focus();
    }
});

confirmarSenhaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fazerCadastro(e);
    }
});
