let profile;

async function iniciar(){

profile = await pegarProfile();

if(profile){

document.getElementById("setup").style.display="none";
document.getElementById("app").style.display="block";

document.getElementById("nomeUsuario").innerText =
"Olá, "+profile.nome;

carregarDashboard();

}

}

async function criarPerfil(){

let nome = document.getElementById("nome").value;

await criarProfile(nome);

iniciar();

}

function abrirForm(){

document.getElementById("app").style.display="none";
document.getElementById("formTela").style.display="block";

}

function voltar(){

document.getElementById("formTela").style.display="none";
document.getElementById("app").style.display="block";

}
