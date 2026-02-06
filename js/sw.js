const CACHE_NAME = "pixello-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/script.js",
  "./js/splashscreen.js",
  "./icons/pixello-transp.png",
  "./icons/terastudio26_pixe.png",
  "./icons/youtube.png",
  "./icons/instagram.png",
  "./icons/tiktok.png",
  "./icons/github.png",
  "./icons/huggingface.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

// FETCH (offline-first)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
