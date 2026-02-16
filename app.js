```javascript
// ================================
// BODYTRACK PRO - APP.JS FINAL
// ================================

// BANCO
let db;
let profile;
let charts = {};

// ================================
// INICIAR BANCO
// ================================

const request = indexedDB.open("bodytrack", 1);

request.onupgradeneeded = e => {

    db = e.target.result;

    db.createObjectStore("profiles", {
        keyPath: "id",
        autoIncrement: true
    });

    const medidas = db.createObjectStore("medidas", {
        keyPath: "id",
        autoIncrement: true
    });

    medidas.createIndex("profileId", "profileId");

};

request.onsuccess = async e => {

    db = e.target.result;

    profile = await pegarProfile();

    if(profile){

        iniciarApp();

    }else{

        document.getElementById("setup").classList.remove("hidden");

    }

};

// ================================
// PERFIL
// ================================

function criarPerfil(){

    const nome = document.getElementById("nome").value;

    const tx = db.transaction("profiles", "readwrite");

    tx.objectStore("profiles").add({
        nome: nome
    });

    tx.oncomplete = () => location.reload();

}

function pegarProfile(){

    return new Promise(resolve=>{

        const tx = db.transaction("profiles", "readonly");

        const req = tx.objectStore("profiles").getAll();

        req.onsuccess = () => resolve(req.result[0]);

    });

}

// ================================
// UI
// ================================

function iniciarApp(){

    document.getElementById("setup").classList.add("hidden");

    document.getElementById("app").classList.remove("hidden");

    document.getElementById("nomeUsuario").innerText =
        "Olá, " + profile.nome;

    carregarDashboard();

}

function abrirForm(){

    app.classList.add("hidden");

    formTela.classList.remove("hidden");

}

function voltar(){

    formTela.classList.add("hidden");

    app.classList.remove("hidden");

}

// ================================
// SALVAR MEDIDA
// ================================

function salvarMedida(){

    const data = {

        profileId: profile.id,
        data: new Date(),

        peso: num("peso"),
        gordura: num("gordura"),

        pescoco: num("pescoco"),
        ombro: num("ombro"),
        peito: num("peito"),

        cintura: num("cintura"),
        abdomen: num("abdomen"),
        quadril: num("quadril"),

        bracoE: num("bracoE"),
        bracoD: num("bracoD"),

        antebracoE: num("antebracoE"),
        antebracoD: num("antebracoD"),

        coxaE: num("coxaE"),
        coxaD: num("coxaD"),

        panturrilhaE: num("panturrilhaE"),
        panturrilhaD: num("panturrilhaD")

    };

    const tx = db.transaction("medidas", "readwrite");

    tx.objectStore("medidas").add(data);

    tx.oncomplete = () => {

        voltar();

        setTimeout(()=>{
            carregarDashboard();
        },200);

    };

}

// ================================
// HELPERS
// ================================

function num(id){

    const v = document.getElementById(id).value;

    return v ? Number(v) : null;

}

function media(a,b){

    if(!a || !b) return null;

    return (a+b)/2;

}

// ================================
// PEGAR MEDIDAS
// ================================

function pegarMedidas(){

    return new Promise(resolve=>{

        const tx = db.transaction("medidas","readonly");

        const index = tx.objectStore("medidas").index("profileId");

        const req = index.getAll(profile.id);

        req.onsuccess = ()=> resolve(req.result);

    });

}

// ================================
// DASHBOARD
// ================================

async function carregarDashboard(){

    const medidas = await pegarMedidas();

    if(!medidas.length) return;

    medidas.sort((a,b)=> new Date(a.data) - new Date(b.data));

    const ultimo = medidas[medidas.length-1];

    animarNumero("pesoAtual", ultimo.peso, " kg");

    const labels = medidas.map(m=>
        new Date(m.data).toLocaleDateString()
    );

    criarGrafico("graficoPeso","Peso",labels,
        medidas.map(m=>m.peso),"#22c55e");

    criarGrafico("graficoGordura","Gordura",labels,
        medidas.map(m=>m.gordura),"#f97316");

    criarGrafico("graficoPescoco","Pescoço",labels,
        medidas.map(m=>m.pescoco),"#84cc16");

    criarGrafico("graficoOmbro","Ombro",labels,
        medidas.map(m=>m.ombro),"#ef4444");

    criarGrafico("graficoPeito","Peito",labels,
        medidas.map(m=>m.peito),"#3b82f6");

    criarGrafico("graficoCintura","Cintura",labels,
        medidas.map(m=>m.cintura),"#0ea5e9");

    criarGrafico("graficoAbdomen","Abdômen",labels,
        medidas.map(m=>m.abdomen),"#eab308");

    criarGrafico("graficoQuadril","Quadril",labels,
        medidas.map(m=>m.quadril),"#a855f7");

    criarGrafico("graficoBracos","Braços",labels,
        medidas.map(m=>media(m.bracoE,m.bracoD)),"#ec4899");

    criarGrafico("graficoAntebracos","Antebraços",labels,
        medidas.map(m=>media(m.antebracoE,m.antebracoD)),"#f43f5e");

    criarGrafico("graficoCoxas","Coxas",labels,
        medidas.map(m=>media(m.coxaE,m.coxaD)),"#6366f1");

    criarGrafico("graficoPanturrilhas","Panturrilhas",labels,
        medidas.map(m=>media(m.panturrilhaE,m.panturrilhaD)),"#06b6d4");

}

// ================================
// GRAFICO ANIMADO
// ================================

function criarGrafico(id,label,labels,data,cor){

    const ctx = document.getElementById(id);

    if(!ctx) return;

    if(charts[id]) charts[id].destroy();

    charts[id] = new Chart(ctx,{

        type:"line",

        data:{
            labels,
            datasets:[{
                label,
                data,
                borderColor:cor,
                backgroundColor:cor+"33",
                fill:true,
                tension:0.4
            }]
        },

        options:{
            animation:{
                duration:1200,
                easing:"easeOutQuart"
            },
            plugins:{
                legend:{
                    labels:{color:"#e2e8f0"}
                }
            },
            scales:{
                x:{ticks:{color:"#94a3b8"}},
                y:{ticks:{color:"#94a3b8"}}
            }
        }

    });

}

// ================================
// ANIMAR NUMERO
// ================================

function animarNumero(id,valor,sufixo=""){

    const el=document.getElementById(id);

    let atual=0;

    const duracao=800;

    const passos=30;

    const incremento=valor/passos;

    let i=0;

    const intervalo=setInterval(()=>{

        atual+=incremento;

        el.innerText=atual.toFixed(1)+sufixo;

        i++;

        if(i>=passos){

            el.innerText=valor+sufixo;

            clearInterval(intervalo);

        }

    },duracao/passos);

}
```
