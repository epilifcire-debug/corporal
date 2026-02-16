const CACHE_NAME = "bodytrack-v1";

const urlsToCache = [

"/",
"/index.html",

"/css/style.css",

"/js/app.js",
"/js/db.js",
"/js/medidas.js",
"/js/charts.js",

"/manifest.json",

"https://cdn.jsdelivr.net/npm/chart.js"

];

self.addEventListener("install", event => {

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache => cache.addAll(urlsToCache))

);

});

self.addEventListener("fetch", event => {

event.respondWith(

caches.match(event.request)
.then(response => {

return response || fetch(event.request);

})

);

});
