// Minimal service worker so the app is installable to the home screen on a Pixel.
// Pass-through fetch (no caching of private data) — the app talks to the home rig live.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response("Offline", { status: 503 })));
});
