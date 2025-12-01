// PWA離線功能 - Service Worker
// 這個檔案讓網頁可以離線使用，就像手機App一樣

// 設定快取版本和要快取的檔案
const CACHE_NAME = 'step-counter-v1.6';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/media/click.mp3',
  '/media/achievement.mp3',
  '/media/audience.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2'
];

// 第一次安裝時：把所有檔案存到快取裡
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 使用者瀏覽網頁時：優先使用快取的檔案
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取裡有這個檔案，就直接用（離線也能用）
        if (response) {
          return response;
        }
        // 如果快取裡沒有，就從網路下載
        return fetch(event.request);
      })
  );
});

// 更新時：刪除舊版本的快取檔案
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 