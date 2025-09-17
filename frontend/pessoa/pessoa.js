// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentPersonCpf = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pessoasTableBody = document.getElementById('pessoasTableBody');
const messageContainer = document.getElementById('messageContainer');

// Elementos específicos
const checkboxFuncionario = document.getElementById('checkboxFuncionario');
const checkboxCliente = document.getElementById('checkboxCliente');
const funcionarioFields = document.getElementById('funcionarioFields');
const salarioInput = document.getElementById('salario');
const cargoSelect = document.getElementById('id_cargo');

// Carregar dados ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarPessoas();
    carregarCargos();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    btnBuscar.addEventListener('click', buscarPessoa);
    btnIncluir.addEventListener('click', incluirPessoa);
    btnAlterar.addEventListener('click', alterarPessoa);
    btnExcluir.addEventListener('click', excluirPessoa);
    btnCancelar.addEventListener('click', cancelarOperacao);
    btnSalvar.addEventListener('click', salvarOperacao);
    
    // Event listener para checkbox de funcionário
    checkboxFuncionario.addEventListener('change', function() {
        if (this.checked) {
            funcionarioFields.style.display = 'block';
            salarioInput.required = true;
            cargoSelect.required = true;
        } else {
            funcionarioFields.style.display = 'none';
            salarioInput.required = false;
            cargoSelect.required = false;
            salarioInput.value = '';
            cargoSelect.value = '';
        }
    });
}

// Configuração inicial dos botões
mostrarBotoes(true, false, false, false, false, false);
bloquearCampos(false);

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 4000);
}

// Função para bloquear/desbloquear campos
function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            input.disabled = bloquearPrimeiro;
        } else {
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    currentPersonCpf = null;
    funcionarioFields.style.display = 'none';
    salarioInput.required = false;
    cargoSelect.required = false;
}

// Função para mostrar/ocultar botões
function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para carregar cargos
async function carregarCargos() {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos`);
        if (!response.ok) throw new Error('Erro ao carregar cargos');

        const cargos = await response.json();
        cargoSelect.innerHTML = '<option value="">Selecione um cargo</option>';

        cargos.forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo.id_cargo;
            option.textContent = cargo.nome_cargo;
            cargoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cargos:', error);
        mostrarMensagem('Erro ao carregar cargos', 'error');
    }
}

// Função para buscar pessoa por CPF
async function buscarPessoa() {
    const cpf = searchId.value.trim();
    if (!cpf) {
        mostrarMensagem('Digite um CPF para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/pessoas/${cpf}`);

        if (response.ok) {
            const pessoa = await response.json();
            await preencherFormulario(pessoa);
            mostrarBotoes(true, false, true, true, false, false);
            mostrarMensagem('Pessoa encontrada!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = cpf;
            mostrarBotoes(true, true, false, false, false, false);
            mostrarMensagem('Pessoa não encontrada. Você pode incluir uma nova pessoa.', 'info');
            bloquearCampos(false);
        } else {
            throw new Error('Erro ao buscar pessoa');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pessoa', 'error');
    }
}

// Função para preencher formulário com dados da pessoa
async function preencherFormulario(pessoa) {
    currentPersonCpf = pessoa.cpf;
    searchId.value = pessoa.cpf;
    document.getElementById('nome_pessoa').value = pessoa.nome_pessoa || '';
    document.getElementById('email_pessoa').value = pessoa.email_pessoa || '';
    document.getElementById('senha_pessoa').value = pessoa.senha_pessoa || '';
    document.getElementById('cpf_pessoa').value = pessoa.cpf || '';

    // Verificar se é funcionário
    try {
        const funcionarioResponse = await fetch(`${API_BASE_URL}/funcionarios/pessoa/${pessoa.cpf}`);
        if (funcionarioResponse.ok) {
            const funcionario = await funcionarioResponse.json();
            checkboxFuncionario.checked = true;
            funcionarioFields.style.display = 'block';
            salarioInput.value = funcionario.salario || '';
            cargoSelect.value = funcionario.id_cargo || '';
            salarioInput.required = true;
            cargoSelect.required = true;
        } else {
            checkboxFuncionario.checked = false;
            funcionarioFields.style.display = 'none';
            salarioInput.required = false;
            cargoSelect.required = false;
        }
    } catch (error) {
        console.error('Erro ao verificar funcionário:', error);
        checkboxFuncionario.checked = false;
    }

    // Verificar se é cliente
    try {
        const clienteResponse = await fetch(`${API_BASE_URL}/clientes/pessoa/${pessoa.cpf}`);
        checkboxCliente.checked = clienteResponse.ok;
    } catch (error) {
        console.error('Erro ao verificar cliente:', error);
        checkboxCliente.checked = false;
    }
}

// Função para incluir pessoa
function incluirPessoa() {
    mostrarMensagem('Digite os dados da nova pessoa!', 'info');
    currentPersonId = searchId.value;
    limparFormulario();
    searchId.value = currentPersonId;
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_pessoa').focus();
    operacao = 'incluir';
}

// Função para alterar pessoa
function alterarPessoa() {
    mostrarMensagem('Altere os dados da pessoa!', 'info');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_pessoa').focus();
    operacao = 'alterar';
}

// Função para excluir pessoa
function excluirPessoa() {
    mostrarMensagem('Confirme a exclusão salvando...', 'warning');
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
}

// Função para salvar operação
async function salvarOperacao() {
    try {
        const formData = new FormData(form);
        const pessoaData = {
            nome_pessoa: formData.get('nome_pessoa'),
            email_pessoa: formData.get('email_pessoa'),
            senha_pessoa: formData.get('senha_pessoa'),
            cpf: formData.get('cpf_pessoa')
        };

        // Validações básicas
        if (!pessoaData.nome_pessoa || !pessoaData.email_pessoa || !pessoaData.cpf) {
            mostrarMensagem('Preencha todos os campos obrigatórios!', 'warning');
            return;
        }

        if (checkboxFuncionario.checked) {
            if (!formData.get('salario') || !formData.get('id_cargo')) {
                mostrarMensagem('Preencha salário e cargo para funcionários!', 'warning');
                return;
            }
        }

        let response;
        
        if (operacao === 'incluir') {
            if (searchId.value) {
                pessoaData.id_pessoa = parseInt(searchId.value);
            }
            response = await fetch(`${API_BASE_URL}/pessoas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pessoaData)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/pessoas/${currentPersonCpf}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pessoaData)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/pessoas/${currentPersonCpf}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            let pessoaCriada = null;
            if (operacao !== 'excluir') {
                pessoaCriada = await response.json();
            }

            // Gerenciar funcionário
            if (checkboxFuncionario.checked && operacao !== 'excluir') {
                const funcionarioData = {
                    cpf: pessoaData.cpf,
                    id_cargo: parseInt(formData.get('id_cargo')),
                    salario: parseFloat(formData.get('salario'))
                };

                try {
                    const funcionarioResponse = await fetch(`${API_BASE_URL}/funcionarios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(funcionarioData)
                    });
                    
                    if (!funcionarioResponse.ok && funcionarioResponse.status !== 409) {
                        console.error('Erro ao criar funcionário');
                    }
                } catch (error) {
                    console.error('Erro ao gerenciar funcionário:', error);
                }
            }

            // Gerenciar cliente
            if (checkboxCliente.checked && operacao !== 'excluir') {
                const clienteData = {
                    cpf: pessoaData.cpf
                };

                try {
                    const clienteResponse = await fetch(`${API_BASE_URL}/clientes`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(clienteData)
                    });
                    
                    if (!clienteResponse.ok && clienteResponse.status !== 409) {
                        console.error('Erro ao criar cliente');
                    }
                } catch (error) {
                    console.error('Erro ao gerenciar cliente:', error);
                }
            }

            mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
            limparFormulario();
            carregarPessoas();
        } else {
            const error = await response.json();
            mostrarMensagem(error.error || `Erro ao ${operacao} pessoa`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem(`Erro ao ${operacao} pessoa`, 'error');
    }

    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchId.focus();
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchId.focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de pessoas
async function carregarPessoas() {
    try {
        const response = await fetch(`${API_BASE_URL}/pessoas`);
        if (response.ok) {
            const pessoas = await response.json();
            await renderizarTabelaPessoas(pessoas);
        } else {
            throw new Error('Erro ao carregar pessoas');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pessoas', 'error');
    }
}

// Função para renderizar tabela de pessoas
async function renderizarTabelaPessoas(pessoas) {
    pessoasTableBody.innerHTML = '';

    for (const pessoa of pessoas) {
        const row = document.createElement('tr');
        
        // Verificar se é funcionário
        let funcionarioInfo = { ehFuncionario: false, cargo: '-', salario: '-' };
        try {
            const funcionarioResponse = await fetch(`${API_BASE_URL}/funcionarios/pessoa/${pessoa.cpf}`);
            if (funcionarioResponse.ok) {
                const funcionario = await funcionarioResponse.json();
                funcionarioInfo = {
                    ehFuncionario: true,
                    cargo: funcionario.nome_cargo || '-',
                    salario: funcionario.salario_funcionario ? `R$ ${parseFloat(funcionario.salario_funcionario).toFixed(2)}` : '-'
                };
            }
        } catch (error) {
            console.error('Erro ao verificar funcionário:', error);
        }

        // Verificar se é cliente
        let ehCliente = false;
        try {
            const clienteResponse = await fetch(`${API_BASE_URL}/clientes/pessoa/${pessoa.cpf}`);
            ehCliente = clienteResponse.ok;
        } catch (error) {
            console.error('Erro ao verificar cliente:', error);
        }

        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarPessoa('${pessoa.cpf}')">
                    ${pessoa.cpf}
                </button>
            </td>
            <td>${pessoa.nome_pessoa}</td>
            <td>${pessoa.email_pessoa}</td>
            <td>${funcionarioInfo.ehFuncionario ? '✅ Sim' : '❌ Não'}</td>
            <td>${ehCliente ? '✅ Sim' : '❌ Não'}</td>
            <td>${funcionarioInfo.cargo}</td>
            <td>${funcionarioInfo.salario}</td>
        `;
        pessoasTableBody.appendChild(row);
    }
}

// Função para selecionar pessoa da tabela
async function selecionarPessoa(cpf) {
    searchId.value = cpf;
    await buscarPessoa();
}
