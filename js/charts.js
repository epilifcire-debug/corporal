let chart;

function renderGrafico(medidas){

let ctx = document.getElementById("graficoPeso");

let labels = medidas.map(m=>
new Date(m.data).toLocaleDateString()
);

let data = medidas.map(m=>m.peso);

if(chart) chart.destroy();

chart = new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[{

label:"Peso",

data:data

}]

}

});

}
