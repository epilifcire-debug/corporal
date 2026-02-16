```javascript
/* BODYTRACK PRO - APP.JS FINAL LIMPO E CORRIGIDO */

"use strict";

/* =========================
   VARIÁVEIS GLOBAIS
========================= */

let db = null;
let profile = null;
let charts = {};

/* =========================
   INICIAR BANCO
========================= */

const request = indexedDB.open("bodytrack", 1);

request.onupgradeneeded = function(event){

    db = event.target.result;

    if(!db.objectStoreNames.contains("profiles")){

        db.createObjectStore("profiles", {
            keyPath: "id",
            autoIncrement: true
        });

    }

    if(!db.objectStoreNames.contains("medidas")){

        const medidas = db.createObjectStore("medidas", {
            keyPath: "id",
            autoIncrement: true
        });

        medidas.createIndex("profileId", "profileId", { unique:false });

    }

};

request.onsuccess = async function(event){

    db = event.target.result;

    try{

        profile = await pegarProfile();

        if(profile){

            iniciarApp();

        }else{

            mostrarSetup();

        }

    }catch(e){

        console.error("Erro ao carregar profile:", e);

    }

};

request.onerror = function(){

    console.error("Erro ao abrir banco");

};

/* =========================
   PERFIL
========================= */

function criarPerfil(){

    const nomeInput = document.getElementById("nome");

    if(!nomeInput || nomeInput.value.trim() === ""){

        alert("Digite seu nome");

        return;

    }

    const tx = db.transaction("profiles", "readwrite");

    tx.objectStore("profiles").add({

        nome: nomeInput.value.trim(),
        criado: new Date()

    });

    tx.oncomplete = function(){

        location.reload();

    };

}

function pegarProfile(){

    return new Promise(function(resolve){

        const tx = db.transaction("profiles", "readonly");

        const req = tx.objectStore("profiles").getAll();

        req.onsuccess = function(){

            resolve(req.result[0] || null);

        };

        req.onerror = function(){

            resolve(null);

        };

    });

}

/* =========================
   UI
========================= */

function iniciarApp(){

    esconder("setup");

    mostrar("app");

    const el = document.getElementById("nomeUsuario");

    if(el && profile){

        el.innerText = "Olá, " + profile.nome;

    }

    carregarDashboard();

}

function mostrarSetup(){

    mostrar("setup");

}

function abrirForm(){

    esconder("app");

    mostrar("formTela");

}

function voltar(){

    esconder("formTela");

    mostrar("app");

}

function mostrar(id){

    const el = document.getElementById(id);

    if(el) el.classList.remove("hidden");

}

function esconder(id){

    const el = document.getElementById(id);

    if(el) el.classList.add("hidden");

}

/* =========================
   SALVAR MEDIDA
========================= */

function salvarMedida(){

    if(!profile) return;

    const dados = {

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

    tx.objectStore("medidas").add(dados);

    tx.oncomplete = function(){

        voltar();

        setTimeout(carregarDashboard, 200);

    };

}

/* =========================
   HELPERS
========================= */

function num(id){

    const el = document.getElementById(id);

    if(!el || el.value === "") return null;

    const v = Number(el.value);

    return isNaN(v) ? null : v;

}

function media(a,b){

    if(a == null || b == null) return null;

    return (a + b) / 2;

}

/* =========================
   PEGAR MEDIDAS
========================= */

function pegarMedidas(){

    return new Promise(function(resolve){

        if(!profile){

            resolve([]);
            return;

        }

        const tx = db.transaction("medidas", "readonly");

        const index = tx.objectStore("medidas").index("profileId");

        const req = index.getAll(profile.id);

        req.onsuccess = function(){

            resolve(req.result || []);

        };

        req.onerror = function(){

            resolve([]);

        };

    });

}

/* =========================
   DASHBOARD
========================= */

async function carregarDashboard(){

    const medidas = await pegarMedidas();

    if(!medidas || medidas.length === 0) return;

    medidas.sort(function(a,b){

        return new Date(a.data) - new Date(b.data);

    });

    const ultimo = medidas[medidas.length - 1];

    if(ultimo && ultimo.peso != null){

        animarNumero("pesoAtual", ultimo.peso, " kg");

    }

    const labels = medidas.map(function(m){

        return new Date(m.data).toLocaleDateString();

    });

    grafico("graficoPeso","Peso",labels,medidas.map(m=>m.peso),"#22c55e");
    grafico("graficoGordura","Gordura",labels,medidas.map(m=>m.gordura),"#f97316");
    grafico("graficoPescoco","Pescoço",labels,medidas.map(m=>m.pescoco),"#84cc16");
    grafico("graficoOmbro","Ombro",labels,medidas.map(m=>m.ombro),"#ef4444");
    grafico("graficoPeito","Peito",labels,medidas.map(m=>m.peito),"#3b82f6");
    grafico("graficoCintura","Cintura",labels,medidas.map(m=>m.cintura),"#0ea5e9");
    grafico("graficoAbdomen","Abdômen",labels,medidas.map(m=>m.abdomen),"#eab308");
    grafico("graficoQuadril","Quadril",labels,medidas.map(m=>m.quadril),"#a855f7");
    grafico("graficoBracos","Braços",labels,medidas.map(m=>media(m.bracoE,m.bracoD)),"#ec4899");
    grafico("graficoAntebracos","Antebraços",labels,medidas.map(m=>media(m.antebracoE,m.antebracoD)),"#f43f5e");
    grafico("graficoCoxas","Coxas",labels,medidas.map(m=>media(m.coxaE,m.coxaD)),"#6366f1");
    grafico("graficoPanturrilhas","Panturrilhas",labels,medidas.map(m=>media(m.panturrilhaE,m.panturrilhaD)),"#06b6d4");

}

/* =========================
   GRAFICOS
========================= */

function grafico(id,label,labels,data,cor){

    if(typeof Chart === "undefined"){

        console.error("Chart.js não carregado");
        return;

    }

    const canvas = document.getElementById(id);

    if(!canvas) return;

    if(charts[id]) charts[id].destroy();

    charts[id] = new Chart(canvas,{

        type:"line",

        data:{

            labels:labels,

            datasets:[{

                label:label,

                data:data,

                borderColor:cor,

                backgroundColor:cor+"33",

                tension:0.4,

                fill:true

            }]

        },

        options:{

            animation:{ duration:1200 },

            responsive:true,

            plugins:{

                legend:{ labels:{ color:"#e2e8f0" } }

            },

            scales:{

                x:{ ticks:{ color:"#94a3b8" } },

                y:{ ticks:{ color:"#94a3b8" } }

            }

        }

    });

}

/* =========================
   ANIMAR NUMERO
========================= */

function animarNumero(id,valor,sufixo){

    const el = document.getElementById(id);

    if(!el || valor == null) return;

    let atual = 0;

    const passos = 30;

    const incremento = valor / passos;

    let i = 0;

    const timer = setInterval(function(){

        atual += incremento;

        el.innerText = atual.toFixed(1) + sufixo;

        i++;

        if(i >= passos){

            el.innerText = valor + sufixo;

            clearInterval(timer);

        }

    },25);

}
```
