const API_BASE_URL = 'http://localhost:3001';
let currentPagamentoId = null;
let operacao = null;

const form = document.getElementById('pagamentoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pagamentosTableBody = document.getElementById('pagamentosTableBody');
const messageContainer = document.getElementById('messageContainer');

document.addEventListener('DOMContentLoaded', () => {
    carregarPagamentos();
});

btnBuscar.addEventListener('click', buscarPagamento);
btnIncluir.addEventListener('click', incluirPagamento);
btnAlterar.addEventListener('click', alterarPagamento);
btnExcluir.addEventListener('click', excluirPagamento);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);

function mostrarMensagem(texto, tipo='info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(()=> messageContainer.innerHTML='',3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input,index)=>{
        if(index===0) input.disabled = bloquearPrimeiro;
        else input.disabled = !bloquearPrimeiro;
    });
}

function limparFormulario() { form.reset(); }

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar){
    btnBuscar.style.display = btBuscar?'inline-block':'none';
    btnIncluir.style.display = btIncluir?'inline-block':'none';
    btnAlterar.style.display = btAlterar?'inline-block':'none';
    btnExcluir.style.display = btExcluir?'inline-block':'none';
    btnSalvar.style.display = btSalvar?'inline-block':'none';
    btnCancelar.style.display = btCancelar?'inline-block':'none';
}

// Funções CRUD adaptadas
async function buscarPagamento(){
    const id = searchId.value.trim();
    if(!id){ mostrarMensagem('Digite um ID','warning'); return; }
    try{
        const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`);
        if(response.ok){
            const pagamento = await response.json();
            preencherFormulario(pagamento);
            mostrarBotoes(true,false,true,true,false,false);
            mostrarMensagem('Pagamento encontrado','success');
        } else if(response.status===404){
            limparFormulario(); searchId.value=id;
            mostrarBotoes(true,true,false,false,false,false);
            mostrarMensagem('Pagamento não encontrado. Pode incluir novo.','info');
        } else throw new Error('Erro ao buscar pagamento');
    }catch(e){ console.error(e); mostrarMensagem('Erro ao buscar pagamento','error'); }
}

function preencherFormulario(pagamento){
    currentPagamentoId = pagamento.id_pagamento;
    searchId.value = pagamento.id_pagamento;
    document.getElementById('id_pedido').value = pagamento.id_pedido;
    document.getElementById('data_pagamento').value = pagamento.data_pagamento;
    document.getElementById('valor_total').value = pagamento.valor_total;
}

function incluirPagamento(){
    mostrarMensagem('Digite os dados','success');
    currentPagamentoId = searchId.value;
    limparFormulario();
    searchId.value = currentPagamentoId;
    bloquearCampos(true);
    mostrarBotoes(false,false,false,false,true,true);
    document.getElementById('id_pedido').focus();
    operacao='incluir';
}

function alterarPagamento(){
    mostrarMensagem('Digite os dados','success');
    bloquearCampos(true);
    mostrarBotoes(false,false,false,false,true,true);
    operacao='alterar';
}

function excluirPagamento(){
    mostrarMensagem('Excluindo pagamento','info');
    currentPagamentoId = searchId.value;
    searchId.disabled=true;
    bloquearCampos(false);
    mostrarBotoes(false,false,false,false,true,true);
    operacao='excluir';
}

async function salvarOperacao(){
    const formData = new FormData(form);
    const pagamento = {
        id_pedido: formData.get('id_pedido'),
        data_pagamento: formData.get('data_pagamento'),
        valor_total: formData.get('valor_total')
    };
    let response=null;
    try{
        if(operacao==='incluir'){
            response = await fetch(`${API_BASE_URL}/pagamentos`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(pagamento)
            });
        } else if(operacao==='alterar'){
            response = await fetch(`${API_BASE_URL}/pagamentos/${currentPagamentoId}`,{
                method:'PUT',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(pagamento)
            });
        } else if(operacao==='excluir'){
            response = await fetch(`${API_BASE_URL}/pagamentos/${currentPagamentoId}`,{method:'DELETE'});
        }

        if(response.ok && (operacao==='incluir' || operacao==='alterar')){
            const novoPagamento = await response.json();
            mostrarMensagem('Operação '+operacao+' realizada!','success');
            limparFormulario();
            carregarPagamentos();
        } else if(operacao!=='excluir'){
            const error = await response.json();
            mostrarMensagem(error.error||'Erro','error');
        } else {
            mostrarMensagem('Pagamento excluído com sucesso','success');
            limparFormulario();
            carregarPagamentos();
        }
    } catch(e){ console.error(e); mostrarMensagem('Erro na operação','error'); }

    mostrarBotoes(true,false,false,false,false,false);
    bloquearCampos(false);
    searchId.focus();
}

function cancelarOperacao(){
    limparFormulario();
    mostrarBotoes(true,false,false,false,false,false);
    bloquearCampos(false);
    searchId.focus();
    mostrarMensagem('Operação cancelada','info');
}

async function carregarPagamentos(){
    try{
        const response = await fetch(`${API_BASE_URL}/pagamentos`);
        if(response.ok){
            const pagamentos = await response.json();
            renderizarTabelaPagamentos(pagamentos);
        } else throw new Error('Erro ao carregar pagamentos');
    }catch(e){ console.error(e); mostrarMensagem('Erro ao carregar lista','error'); }
}

function renderizarTabelaPagamentos(pagamentos){
    pagamentosTableBody.innerHTML='';
    pagamentos.forEach(p=>{
        const row = document.createElement('tr');
        row.innerHTML=`
            <td><button class="btn-id" onclick="selecionarPagamento(${p.id_pagamento})">${p.id_pagamento}</button></td>
            <td>${p.id_pedido}</td>
            <td>${p.data_pagamento}</td>
            <td>${p.valor_total}</td>
        `;
        pagamentosTableBody.appendChild(row);
    });
}

async function selecionarPagamento(id){
    searchId.value=id;
    await buscarPagamento();
}
