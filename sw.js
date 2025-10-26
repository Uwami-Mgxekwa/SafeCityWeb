// SafeCity Service Worker
const CACHE_NAME = 'safecity-v1.0.1'; // Changed version to force update
const urlsToCache = [
    './css/styles.css',
    './css/auth.css',
    './js/script.js',
    './js/auth.js',
    './assets/logo-6.jpeg',
    './manifest.json',
    './pages/offline.html',
    // External resources
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('🔧 SafeCity Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 SafeCity Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('❌ SafeCity Service Worker: Cache failed', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('✅ SafeCity Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ SafeCity Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Claim control of all clients
    self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip external API calls (let them fail gracefully)
    if (event.request.url.includes('supabase.co') || 
        event.request.url.includes('emailjs.com')) {
        return;
    }
    
    // IMPORTANT: Don't cache HTML pages to avoid redirect loops
    if (event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Only show offline page if we're truly offline
                    return caches.match('./pages/offline.html');
                })
        );
        return;
    }
    
    // For all other resources (CSS, JS, images, fonts)
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('📦 SafeCity Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If both cache and network fail, return a generic offline response
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync for offline report submissions
self.addEventListener('sync', (event) => {
    console.log('🔄 SafeCity Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync-reports') {
        event.waitUntil(syncOfflineReports());
    }
});

// Sync offline reports when connection is restored
async function syncOfflineReports() {
    try {
        console.log('🔄 SafeCity Service Worker: Syncing offline reports...');
        
        // Notify the main app about sync
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_COMPLETE',
                    count: 0
                });
            });
        });
    } catch (error) {
        console.error('❌ SafeCity Service Worker: Background sync failed', error);
    }
}

// Push notification handling (for future implementation)
self.addEventListener('push', (event) => {
    console.log('🔔 SafeCity Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update from SafeCity',
        icon: '/assets/logo-6.jpeg',
        badge: '/assets/logo-6.jpeg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
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
        self.registration.showNotification('SafeCity', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 SafeCity Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('🚀 SafeCity Service Worker: Loaded successfully');