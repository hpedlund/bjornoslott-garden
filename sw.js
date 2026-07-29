const CACHE_NAME = "bjornoslott-garden-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/data/plants.json",
  "/manifest.webmanifest",
  "/assets/bjornoslott-garden-logo.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((response) => response || caches.match("/index.html"))),
  );
});
