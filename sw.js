// 앱 화면과 사진을 휴대폰에 저장해 두고, 인터넷이 없어도 열리게 하는 파일이에요.
// index.html이나 사진을 바꾸면 아래 VERSION 숫자를 하나 올려야 휴대폰에 새 화면이 받아져요.
const VERSION = "filin-v19";
const FILES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./vendor/supabase-js-2.117.3.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
  "./img/bellfor-landgut-mini.jpg",
  "./img/bellfor-landgut.jpg",
  "./img/bellfor-naturgut-coldpressed.jpg",
  "./img/brand-bellfor.jpg",
  "./img/brand-pv-ns.jpg",
  "./img/brand-tow.jpg",
  "./img/filin-badge.png",
  "./img/filin-store.jpg",
  "./img/info-grass-cover.jpg",
  "./img/info-vomit-cover.jpg",
  "./img/ns-cat-kitten-country.jpg",
  "./img/ns-choice-chicken-barley.jpg",
  "./img/ns-choice-large-breed.jpg",
  "./img/ns-choice-performance.jpg",
  "./img/ns-choice-puppy.jpg",
  "./img/ns-choice-turkey-barley.jpg",
  "./img/ns-choice-whitefish-rice.jpg",
  "./img/ns-gf-chicken-peas.jpg",
  "./img/ns-gf-senior.jpg",
  "./img/oli-hi.png",
  "./img/oli-seri-adventure.jpg",
  "./img/oli-seri-mealtime.jpg",
  "./img/oli-seri-walk.jpg",
  "./img/pv-cat-chicken-peas.jpg",
  "./img/pv-cat-salmon-peas.jpg",
  "./img/pv-dog-chicken-brownrice.jpg",
  "./img/pv-dog-pork-blueberry.jpg",
  "./img/pv-dog-salmon-peas.jpg",
  "./img/seri-hi.png",
  "./img/seri-question.png",
  "./img/seri-thinking.jpg",
  "./img/tow-canyon-river-cat.jpg",
  "./img/tow-pacific-stream-dog.jpg",
  "./img/tow-pacific-stream-puppy.jpg",
  "./img/tow-prey-trout-dog.jpg",
  "./img/tow-prey-turkey-cat.jpg",
  "./img/tow-prey-turkey-dog.jpg",
  "./img/vet.jpg",
  "./img/pv-dog-turkey-sweetpotato.jpg",
  "./img/qr-app.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// 화면(html)은 브라우저 임시 저장분도 거치지 않고 인터넷에서 먼저 받아 새 버전을 보여 주고, 사진은 저장해 둔 것을 먼저 써요.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request.url, { cache: "no-cache" }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
