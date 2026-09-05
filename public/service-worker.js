// public/service-worker.js

self.addEventListener('install', function(event) {
    console.log('[SW] Installing...');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    console.log('[SW] Activating...');
    event.waitUntil(self.clients.claim());
});

// ============================================
// 🔥 Firebase Messaging
// ============================================

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyD9Jkv0WzI_SSGAJXHM4w30PhPNhZbggXI",
    authDomain: "coffee-queue-system.firebaseapp.com",
    projectId: "coffee-queue-system",
    storageBucket: "coffee-queue-system.firebasestorage.app",
    messagingSenderId: "1014346204068",
    appId: "1:1014346204068:web:da385bc27605556fd1f731",
    measurementId: "G-694MM57SVM"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ============================================
// استقبال إشعارات الخلفية
// ============================================
messaging.onBackgroundMessage(function(payload) {
    console.log('[SW] Background message:', payload);

    const notificationTitle = payload.notification?.title || '☕ مقهى السعادة';
    const notificationOptions = {
        body: payload.notification?.body || 'تحديث جديد في طلبك',
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y=".9em" font-size="90"%3E☕%3C/text%3E%3C/svg%3E',
        badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y=".9em" font-size="90"%3E☕%3C/text%3E%3C/svg%3E',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: payload.data || {},
        actions: [
            { action: 'open', title: '👀 عرض الطلب' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================
// الضغط على الإشعار
// ============================================
self.addEventListener('notificationclick', function(event) {
    console.log('[SW] Notification clicked:', event);
    event.notification.close();

    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
});

// ============================================
// رسائل من الصفحة
// ============================================
self.addEventListener('message', function(event) {
    console.log('[SW] Message:', event.data);

    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const data = event.data;
        self.registration.showNotification(data.title || '☕ مقهى السعادة', {
            body: data.body || 'تحديث جديد',
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y=".9em" font-size="90"%3E☕%3C/text%3E%3C/svg%3E',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            data: { url: data.url || '/' }
        });
    }
});