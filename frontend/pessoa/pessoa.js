
// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonId = null;
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

// Carregar lista de pessoas ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarPessoas();
});

// =========================
// CARREGAR CARGOS NO SELECT
// =========================
async function carregarCargos() {
    try {
        const response = await fetch('http://localhost:3001/cargos'); // rota do cargo
        if (!response.ok) {
            throw new Error('Erro ao buscar cargos');
        }

        const cargos = await response.json();
        const selectCargo = document.getElementById('cargo_pessoa_cpf');

        // Limpa as opções antes de carregar
        selectCargo.innerHTML = '<option value="">Selecione um cargo</option>';

        // Adiciona os cargos vindos do banco
        cargos.forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo.id_cargo;
            option.textContent = cargo.nome_cargo;
            selectCargo.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar cargos:', error);
    }
}

// Quando a tela carregar, já popula o select de cargos
document.addEventListener('DOMContentLoaded', carregarCargos);


// Event Listeners
btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', incluirPessoa);
btnAlterar.addEventListener('click', alterarPessoa);
btnExcluir.addEventListener('click', excluirPessoa);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
bloquearCampos(false);//libera pk e bloqueia os demais campos

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            // Primeiro elemento - bloqueia se bloquearPrimeiro for true, libera se for false
            input.disabled = bloquearPrimeiro;
        } else {
            // Demais elementos - faz o oposto do primeiro
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
}


function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para converter data para formato ISO
function converterDataParaISO(dataString) {
    if (!dataString) return null;
    return new Date(dataString).toISOString();
}

// Função para buscar pessoa por ID
async function buscarPessoa() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    bloquearCampos(false);
    //focus no campo searchId
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/pessoas/${id}`);

        if (response.ok) {
            const pessoa = await response.json();
            preencherFormulario(pessoa);

            mostrarBotoes(true, false, true, true, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pessoa encontrado!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); //mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pessoa não encontrado. Você pode incluir um novo pessoa.', 'info');
            bloquearCampos(false);//bloqueia a pk e libera os demais campos
            //enviar o foco para o campo de nome
        } else {
            throw new Error('Erro ao buscar pessoa');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pessoa', 'error');
    }
}

// Função para preencher formulário com dados da pessoa
function preencherFormulario(pessoa) {
    currentPersonId = pessoa.cpf;
    searchId.value = pessoa.cpf;
    document.getElementById('nome_pessoa').value = pessoa.nome_pessoa || '';
    document.getElementById('email_pessoa').value = pessoa.email_pessoa || '';
    document.getElementById('senha_pessoa').value = pessoa.senha_pessoa || '';
  }  


// Função para incluir pessoa
async function incluirPessoa() {
    mostrarMensagem('Digite os dados!', 'success');
    currentPersonId = searchId.value;
    // console.log('Incluir novo pessoa - currentPersonId: ' + currentPersonId);
    limparFormulario();
    // mantém o ID buscado
    searchId.value = currentPersonId;
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true); 
    // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    // foca no primeiro campo (nome do pessoa)
    document.getElementById('nome_pessoa').focus();
    // garante que email_pessoa e senha_pessoa começam limpos
    document.getElementById('email_pessoa').value = '';
    document.getElementById('senha_pessoa').value = '';
    operacao = 'incluir';
    // console.log('fim incluir pessoa - currentPersonId: ' + currentPersonId);
}


// Função para alterar pessoa
async function alterarPessoa() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true); 
    // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    // foca no primeiro campo editável
    document.getElementById('nome_pessoa').focus();
    // garante que os campos de preço e estoque estão liberados
    document.getElementById('email_pessoa').disabled = false;
    document.getElementById('senha_pessoa').disabled = false;
    operacao = 'alterar';
}


// Função para excluir pessoa
async function excluirPessoa() {
    mostrarMensagem('Excluindo pessoa...', 'info');
    currentPersonId = searchId.value;
    //bloquear searchId
    searchId.disabled = true;
    bloquearCampos(false); // libera os demais campos
    mostrarBotoes(false, false, false, false, true, true);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)           
    operacao = 'excluir';
}

async function salvarOperacao() {
    console.log('Operação:', operacao + ' - currentPersonId: ' + currentPersonId + ' - searchId: ' + searchId.value);

    const formData = new FormData(form);
    const cpf = searchId.value.trim();

    const pessoa = {
        cpf: cpf,
        nome_pessoa: formData.get('nome_pessoa') || '',
        email_pessoa: formData.get('email_pessoa') || '',
        senha_pessoa: formData.get('senha_pessoa') || ''
    };

    // lê diretamente do DOM (funciona mesmo se os campos estiverem fora do form)
    const isFuncionario = document.getElementById('checkboxFuncionario').checked;
    const salarioFuncionario = parseFloat(document.getElementById('salarioFuncionario').value);
    const idCargo = parseInt(document.getElementById('cargo_pessoa_cpf').value);

    try {
        let response = null;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pessoas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pessoa)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/pessoas/${currentPersonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pessoa)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/pessoas/${currentPersonId}`, {
                method: 'DELETE'
            });
        }

        // TRATAMENTO GERAL: incluir/alterar
        if ((operacao === 'incluir' || operacao === 'alterar')) {
            if (!response.ok) {
                // tenta extrair erro do back, senão mostra mensagem genérica
                const err = await response.json().catch(() => ({}));
                mostrarMensagem(err.error || 'Erro ao salvar pessoa', 'error');
                return;
            }

            const novaPessoa = await response.json(); // normalmente o backend retorna a pessoa criada/atualizada
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');

            // Se é funcionário, salva/atualiza a tabela funcionario
            if (isFuncionario) {
                // validações
                if (!idCargo || isNaN(idCargo) || isNaN(salarioFuncionario) || salarioFuncionario <= 0) {
                    mostrarMensagem('Selecione um cargo e informe o salário válido!', 'error');
                    return;
                }

                const funcionario = {
                    cpf: cpf,          // campo esperado pelo controller: cpf
                    id_cargo: idCargo,
                    salario: salarioFuncionario
                };

                try {
                    if (operacao === 'incluir') {
                        const respFunc = await fetch(`${API_BASE_URL}/funcionarios`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(funcionario)
                        });

                        if (!respFunc.ok) {
                            const err = await respFunc.json().catch(() => ({}));
                            mostrarMensagem(err.error || 'Erro ao salvar funcionário', 'error');
                        } else {
                            mostrarMensagem('Funcionário salvo com sucesso!', 'success');
                        }
                    } else if (operacao === 'alterar') {
                        // supondo que você tenha rota PUT /funcionarios/:cpf para atualizar funcionário
                        const respFunc = await fetch(`${API_BASE_URL}/funcionarios/${cpf}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(funcionario)
                        });

                        if (!respFunc.ok) {
                            const err = await respFunc.json().catch(() => ({}));
                            mostrarMensagem(err.error || 'Erro ao atualizar funcionário', 'error');
                        } else {
                            mostrarMensagem('Dados de funcionário atualizados', 'success');
                        }
                    }
                } catch (err) {
                    console.error('Erro ao salvar/atualizar funcionário:', err);
                    mostrarMensagem('Erro ao salvar dados de funcionário', 'error');
                }
            }

            // limpa e recarrega
            limparFormulario();
            carregarPessoas();

        } else if (operacao === 'excluir') {
            if (response.ok) {
                mostrarMensagem('Pessoa excluída com sucesso!', 'success');
                limparFormulario();
                carregarPessoas();
            } else {
                mostrarMensagem('Erro ao excluir pessoa', 'error');
            }
        }

    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao incluir ou alterar a pessoa', 'error');
    } finally {
        mostrarBotoes(true, false, false, false, false, false);
        bloquearCampos(false);
        document.getElementById('searchId').focus();
    }
}


// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    bloquearCampos(false);//libera pk e bloqueia os demais campos
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de pessoas
async function carregarPessoas() {
    try {
        const response = await fetch(`${API_BASE_URL}/pessoas`);
    //    debugger
        if (response.ok) {
            const pessoas = await response.json();
            renderizarTabelaPessoas(pessoas);
        } else {
            throw new Error('Erro ao carregar pessoas');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pessoas', 'error');
    }
}

// Função para renderizar tabela de pessoas
function renderizarTabelaPessoas(pessoas) {
    pessoasTableBody.innerHTML = '';

    pessoas.forEach(pessoa => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarPessoa(${pessoa.cpf})">
                    ${pessoa.cpf}
                </button>
            </td>
            <td>${pessoa.nome_pessoa}</td>
            <td>${pessoa.email_pessoa}</td>
            <td>${pessoa.senha_pessoa}</td>
        `;
        pessoasTableBody.appendChild(row);
    });
}


// Função para selecionar pessoa da tabela
async function selecionarPessoa(id) {
    searchId.value = id;
    await buscarPessoa();
}