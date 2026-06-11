// budge· service worker — caches the app shell so repeat visits and
// home-screen launches load instantly and work offline.
//
// Strategy:
//   - Cross-origin requests (Supabase API, etc.) are never touched — always
//     hit the network so data is live and never cached.
//   - Page navigations: network-first (fresh index.html when online, so new
//     builds are picked up), falling back to cache when offline.
//   - Static assets (hashed JS/CSS/images): stale-while-revalidate — serve the
//     cached copy instantly, refresh it in the background. Vite fingerprints
//     filenames, so a new build naturally fetches new files.
//
// The Settings → "Check for updates" button clears this cache and reloads to
// force the very latest, in case anything is stale.

const CACHE = "budge-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave the API alone

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return (await caches.match(req)) || (await caches.match("./")) || Response.error();
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE).then((c) => c.put(req, res.clone()));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
