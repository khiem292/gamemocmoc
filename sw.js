/* Mộc Mộc Farm: giữ một địa chỉ cố định trên GitHub Pages.
 * Ưu tiên tải file mới từ mạng, dùng cache chỉ khi mất kết nối.
 * Khi phát hành bản có thay đổi service worker, đổi CACHE để dọn cache cũ.
 */
const CACHE = 'mocmoc-farm-v8-landscape-compact';
const CORE = [
  './', './index.html', './style.css', './audio.js', './game.js', './farm-theme.mp3',
  './pixel-world.js', './firebase-config.js', './social-auth.js', './manifest.webmanifest', './assets/icon-192.png', './assets/icon-512.png'
];
const SCOPE = new URL(self.registration.scope);
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(
      CORE.map(path => new Request(new URL(path, SCOPE).href, { cache: 'reload' }))
    )).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('mocmoc-farm-') && key !== CACHE)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  // Không dùng bản JavaScript/CSS/HTML cũ khi iPhone đang có Internet.
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: 'no-store' });
      if (fresh.ok && fresh.type !== 'opaque') {
        const cache = await caches.open(CACHE);
        // Lưu vào cache để vẫn chơi được khi không có mạng.
        await cache.put(req, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (err) {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const offlinePage = await caches.match(new URL('./index.html', SCOPE).href);
        if (offlinePage) return offlinePage;
      }
      throw err;
    }
  })());
});
