// SafeCity Service Worker
const CACHE_NAME = 'safecity-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './pages/dashboard.html',
    './pages/offline.html',
    './css/styles.css',
    './js/script.js',
    './js/auth.js',
    './assets/logo-6.jpeg',
    './manifest.json',
    // External resources
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
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
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('📦 SafeCity Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
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
                        // If both cache and network fail, show offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('./pages/offline.html');
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
        
        // Get offline reports from IndexedDB or localStorage
        const offlineReports = await getOfflineReports();
        
        if (offlineReports.length > 0) {
            console.log(`📤 SafeCity Service Worker: Found ${offlineReports.length} offline reports to sync`);
            
            // Send each report to the server
            for (const report of offlineReports) {
                try {
                    await submitReportToServer(report);
                    await removeOfflineReport(report.id);
                    console.log('✅ SafeCity Service Worker: Synced report', report.id);
                } catch (error) {
                    console.error('❌ SafeCity Service Worker: Failed to sync report', report.id, error);
                }
            }
            
            // Notify the main app about successful sync
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'REPORTS_SYNCED',
                        count: offlineReports.length
                    });
                });
            });
        }
    } catch (error) {
        console.error('❌ SafeCity Service Worker: Background sync failed', error);
    }
}

// Helper functions for offline report management
async function getOfflineReports() {
    // This would typically use IndexedDB, but for simplicity using localStorage
    try {
        const reports = localStorage.getItem('safecity-offline-reports');
        return reports ? JSON.parse(reports) : [];
    } catch (error) {
        console.error('❌ SafeCity Service Worker: Failed to get offline reports', error);
        return [];
    }
}

async function submitReportToServer(report) {
    // This would submit to your Supabase backend
    const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

async function removeOfflineReport(reportId) {
    try {
        const reports = await getOfflineReports();
        const updatedReports = reports.filter(report => report.id !== reportId);
        localStorage.setItem('safecity-offline-reports', JSON.stringify(updatedReports));
    } catch (error) {
        console.error('❌ SafeCity Service Worker: Failed to remove offline report', error);
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