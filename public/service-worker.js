self.addEventListener('install', function(event) {
    console.log('[SW] Installing...');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    console.log('[SW] Activating...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function(event) {
    console.log('[SW] Message:', event.data);
    
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const data = event.data;
        self.registration.showNotification(data.title || '☕ مقهى السعادة', {
            body: data.body || 'تحديث جديد',
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y=".9em" font-size="90"%3E☕%3C/text%3E%3C/svg%3E',
            badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y=".9em" font-size="90"%3E☕%3C/text%3E%3C/svg%3E',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            data: { url: data.url || '/' }
        });
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) return response;
                return fetch(event.request);
            })
    );
});