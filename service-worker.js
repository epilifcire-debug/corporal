const CACHE = "bodytrack-v1";

const FILES = [

"./",
"./index.html",
"./app.js",
"./style.css",
"./manifest.json",

"./icons/icon-192.png",
"./icons/icon-512.png"

];

self.addEventListener("install", event => {

event.waitUntil(

caches.open(CACHE)
.then(cache => cache.addAll(FILES))
.catch(err => console.log("Cache error:", err))

);

});

self.addEventListener("fetch", event => {

event.respondWith(

caches.match(event.request)
.then(response => response || fetch(event.request))

);

});
