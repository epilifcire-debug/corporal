let db;

let request = indexedDB.open("bodytrack",1);

request.onupgradeneeded = function(e){

db = e.target.result;

db.createObjectStore("profiles",{keyPath:"id",autoIncrement:true});

let medidas = db.createObjectStore("medidas",{keyPath:"id",autoIncrement:true});

medidas.createIndex("profileId","profileId",{unique:false});

}

request.onsuccess = function(e){

db = e.target.result;

iniciar();

}

function criarProfile(nome){

return new Promise(resolve=>{

let tx = db.transaction("profiles","readwrite");

tx.objectStore("profiles").add({

nome:nome,
data:new Date()

});

tx.oncomplete=resolve;

});

}

function pegarProfile(){

return new Promise(resolve=>{

let tx = db.transaction("profiles","readonly");

let req = tx.objectStore("profiles").getAll();

req.onsuccess=()=>resolve(req.result[0]);

});

}

function salvarMedidaDB(data){

return new Promise(resolve=>{

let tx = db.transaction("medidas","readwrite");

tx.objectStore("medidas").add(data);

tx.oncomplete=resolve;

});

}

function pegarMedidas(profileId){

return new Promise(resolve=>{

let tx = db.transaction("medidas","readonly");

let store = tx.objectStore("medidas");

let index = store.index("profileId");

let req = index.getAll(profileId);

req.onsuccess=()=>resolve(req.result);

});

}
