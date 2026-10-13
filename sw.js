const CACHE_NAME = 'studysphere-cache-v4';
const QUIZ_CACHE_NAME = 'studysphere-quizzes-cache-v1';

// प्रेश-कॅश रिसोर्सेस (GitHub Pages व सर्व होस्टिंगसाठी १००% सुरक्षित रिलेटिव्ह पाथ्स)
const PRE_CACHE_RESOURCES = [
  './',
  './index.html',
  './test-list.html',
  './test.html',
  './result.html',
  './test-analysis.html',
  './progress.html',
  './404.html',
  './manifest.json',
  './catalog.json',
  './data/catalog.json'
];

// १. Install Event: सुरक्षित कॅशिंग (कोणतीही एक फाईल अनुपलब्ध असली तरी Service Worker सुरळीत इन्स्टॉल होतो)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Resilient Pre-caching: प्रत्येक रिसोर्स स्वतंत्रपणे कॅश करणे
      const cachePromises = PRE_CACHE_RESOURCES.map(async (resource) => {
        try {
          const response = await fetch(resource, { cache: 'no-cache' });
          if (response && (response.status === 200 || response.type === 'opaque')) {
            await cache.put(resource, response);
          }
        } catch (err) {
          console.warn('[Service Worker v4] Pre-cache skipped for non-critical resource:', resource);
        }
      });
      await Promise.all(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

// २. Activate Event: जुने (v1, v2, v3) सर्व कॅश स्टोअर्स तात्काळ साफ करणे
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== QUIZ_CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker v4] Removing old cache store:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// तात्काळ अपडेट सक्रिय करण्यासाठी Client Message Listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ३. Fetch Event: Network-First सह १००% सुरक्षित ऑफलाइन फॉलबॅक
self.addEventListener('fetch', (event) => {
  // केवळ GET विनंत्या हाताळणे
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // बाह्य APIs, ट्रॅकिंग आणि Google Sheets URL नेटवर्कवरूनच थेट जाणे
  if (!url.protocol.startsWith('http')) return;
  if (
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('cloudflareinsights.com') ||
    url.hostname.includes('api.qrserver.com') ||
    url.hostname.includes('quickchart.io')
  ) {
    return;
  }

  // Same-Origin आणि कॅशे हाताळणी
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // नेटवर्क यशस्वी झाल्यास स्थानिक कॅश अद्ययावत करणे
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        // नेटवर्क बंद (Offline) असताना कॅश तपासणी:
        // URL मधील Query Parameters (?section=... &file=...) दुर्लक्षित करून अचूक मॅच शोधणे
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) return cachedResponse;

        // जर Quiz Cache मध्ये प्रश्नपत्रिका असेल तर ती तपासणे
        const quizCachedResponse = await caches.match(event.request);
        if (quizCachedResponse) return quizCachedResponse;

        // Page Navigation विनंती असताना (उदा. लिंकवरून नवीन पानावर जाताना):
        if (event.request.mode === 'navigate') {
          // पाथनुसार संबंधित मुख्य पानाचा ऑफलाइन फॉलबॅक शोधणे
          const pathname = url.pathname.toLowerCase();

          if (pathname.includes('test-list')) {
            const matchTestList = await caches.match('./test-list.html', { ignoreSearch: true });
            if (matchTestList) return matchTestList;
          }
          if (pathname.includes('test.')) {
            const matchTest = await caches.match('./test.html', { ignoreSearch: true });
            if (matchTest) return matchTest;
          }
          if (pathname.includes('result')) {
            const matchResult = await caches.match('./result.html', { ignoreSearch: true });
            if (matchResult) return matchResult;
          }
          if (pathname.includes('test-analysis')) {
            const matchAnalysis = await caches.match('./test-analysis.html', { ignoreSearch: true });
            if (matchAnalysis) return matchAnalysis;
          }
          if (pathname.includes('progress')) {
            const matchProgress = await caches.match('./progress.html', { ignoreSearch: true });
            if (matchProgress) return matchProgress;
          }

          // काहीही न मिळाल्यास होमपेज फॉलबॅक देणे
          const indexFallback = await caches.match('./index.html', { ignoreSearch: true });
          if (indexFallback) return indexFallback;
        }

        // इमेज किंवा इतर ॲसेटसाठी फॉलबॅक
        return new Response('Offline: Resource not available in cache.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
  );
});