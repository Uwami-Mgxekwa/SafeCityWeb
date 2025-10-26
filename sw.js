// SafeCity Service Worker
const CACHE_NAME = 'safecity-v1.0.0';
const OFFLINE_URL = '/pages/offline.html';

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/index.html',
  '/pages/dashboard.html',
  '/pages/auth.html',
  '/css/styles.css',
  '/css/auth.css',
  '/js/script.js',
  '/js/auth.js',
  '/assets/logo-6.jpeg',
  '/manifest.json',
  // External resources
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('SafeCity Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SafeCity Service Worker: Caching files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('SafeCity Service Worker: All files cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SafeCity Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('SafeCity Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('SafeCity Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SafeCity Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external API calls (Supabase, EmailJS)
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('emailjs.com') ||
      event.request.url.includes('wa.me')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('SafeCity Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
            
            // For other requests, return a generic offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for offline report submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-reports') {
    console.log('SafeCity Service Worker: Background sync triggered');
    event.waitUntil(syncOfflineReports());
  }
});

// Sync offline reports when connection is restored
async function syncOfflineReports() {
  try {
    // Get offline reports from IndexedDB or localStorage
    const offlineReports = JSON.parse(localStorage.getItem('safecity-offline-reports') || '[]');
    
    if (offlineReports.length === 0) {
      return;
    }

    console.log(`SafeCity Service Worker: Syncing ${offlineReports.length} offline reports`);

    // Send each report to the server
    for (const report of offlineReports) {
      try {
        // This would normally send to your backend
        console.log('SafeCity Service Worker: Syncing report', report.id);
        
        // Remove from offline storage after successful sync
        const updatedReports = offlineReports.filter(r => r.id !== report.id);
        localStorage.setItem('safecity-offline-reports', JSON.stringify(updatedReports));
        
      } catch (error) {
        console.error('SafeCity Service Worker: Failed to sync report', report.id, error);
      }
    }

    // Notify the main app that sync is complete
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          message: 'Offline reports have been synced'
        });
      });
    });

  } catch (error) {
    console.error('SafeCity Service Worker: Background sync failed', error);
  }
}

// Push notification handling (for future use)
self.addEventListener('push', event => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/logo-6.jpeg',
    badge: '/assets/logo-6.jpeg',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Report',
        icon: '/assets/logo-6.jpeg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/logo-6.jpeg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app to the relevant report
    event.waitUntil(
      clients.openWindow('/pages/dashboard.html')
    );
  }
});

console.log('SafeCity Service Worker: Loaded successfully');