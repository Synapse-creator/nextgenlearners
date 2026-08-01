
// A basic service worker for PWA installability

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // No caching logic needed for a basic PWA, but you could add it here.
  // For example, caching the offline page.
});

self.addEventListener('fetch', (event) => {
  // This basic service worker doesn't intercept fetch requests.
  // It's just here to make the app installable.
  // A more advanced PWA would handle offline caching here.
});
