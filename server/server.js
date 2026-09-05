const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================================
// 🔥 Firebase Admin
// ============================================
const admin = require('firebase-admin');

// تهيئة Firebase من الملف
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
});

const messaging = admin.messaging();

// ============================================
// إعدادات السيرفر
// ============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ... (باقي إعدادات الأمان كما هي) ...

// ============================================
// تخزين FCM Tokens
// ============================================
const fcmTokens = new Map();

// ============================================
// API - تسجيل FCM Token
// ============================================
app.post('/api/register-fcm', [
    body('token').isString().notEmpty(),
    body('orderId').isString().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'بيانات غير صحيحة' });
        }

        const { token, orderId } = req.body;

        if (!fcmTokens.has(orderId)) {
            fcmTokens.set(orderId, []);
        }

        const tokens = fcmTokens.get(orderId);
        if (!tokens.includes(token)) {
            tokens.push(token);
            fcmTokens.set(orderId, tokens);
        }

        console.log(`✅ FCM Token registered for order ${orderId}`);
        res.json({ success: true, message: 'تم تسجيل الجهاز للإشعارات' });
    } catch (error) {
        console.error('❌ Error registering FCM:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ داخلي' });
    }
});

// ============================================
// إرسال إشعار Firebase
// ============================================
async function sendFirebaseNotification(orderId, title, body, data = {}) {
    const tokens = fcmTokens.get(orderId) || [];

    if (tokens.length === 0) {
        console.log(`⚠️ No FCM tokens for order ${orderId}`);
        return;
    }

    const message = {
        notification: { title, body },
        data: {
            orderId: orderId,
            status: data.status || 'update',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            sound: 'default'
        },
        tokens: tokens,
        android: {
            priority: 'high',
            notification: {
                sound: 'default',
                vibrate: [200, 100, 200],
                channelId: 'coffee_orders'
            }
        },
        apns: {
            payload: {
                aps: {
                    sound: 'default',
                    badge: 1,
                    'mutable-content': 1
                }
            }
        }
    };

    try {
        await messaging.sendEachForMulticast(message);
        console.log(`✅ Firebase notification sent to ${tokens.length} devices`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending Firebase notification:', error);
        return { success: false, error };
    }
}

// ============================================
// API - طلب جاهز
// ============================================
app.post('/api/send-ready-notification', [
    body('orderId').isString().notEmpty()
], async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = orders.get(orderId);

        if (!order) {
            return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }

        const result = await sendFirebaseNotification(
            orderId,
            '☕ طلبك جاهز!',
            `طلب رقم ${order.number} (${order.customerName}) جاهز للاستلام`,
            { status: 'ready', orderNumber: order.number }
        );

        res.json({ success: true, message: 'تم إرسال الإشعار', result });
    } catch (error) {
        console.error('❌ Error sending ready notification:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ داخلي' });
    }
});

// ============================================
// API - أنا في طريقي
// ============================================
app.post('/api/on-my-way', [
    body('orderId').isString().notEmpty()
], (req, res) => {
    try {
        const { orderId } = req.body;
        const order = orders.get(orderId);

        if (!order) {
            return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }

        io.emit('customer-on-the-way', {
            orderId: orderId,
            orderNumber: order.number,
            customerName: order.customerName
        });

        res.json({ success: true, message: 'تم إبلاغ البارستا' });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ داخلي' });
    }
});

// ============================================
// باقي الكود (orders, socket.io, run server)
// ============================================
// ... (أضف باقي الكود الخاص بالطلبات و Socket.io هنا) ...

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Firebase Notifications Enabled`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});