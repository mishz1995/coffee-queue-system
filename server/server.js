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

// تهيئة Firebase من ملف الخدمة
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

// ============================================
// 🔒 الأمان
// ============================================

// 1. Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdn.jsdelivr.net", "www.gstatic.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:"],
        },
    },
}));

// 2. Compression
app.use(compression());

// 3. Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: '⚠️ عدد الطلبات كبير جداً، حاول مرة أخرى بعد 15 دقيقة',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// 4. CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 5. Session
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    },
    name: 'coffee_queue_session'
}));

// 6. JSON و Forms
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 7. Static files - تأكد من هذا السطر
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// مسار الصفحة الرئيسية (للتأكد)
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// Service Worker
// ============================================
app.get('/service-worker.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, '../public/service-worker.js'));
});

// ============================================
// تخزين الطلبات و FCM Tokens
// ============================================
const orders = new Map();
const fcmTokens = new Map();
let orderCounter = 1000;

// ============================================
// دوال مساعدة
// ============================================
function generateOrderId() {
    orderCounter++;
    return `ORD-${orderCounter}`;
}

function generateToken(orderId) {
    return jwt.sign(
        { orderId, timestamp: Date.now() },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    } catch {
        return null;
    }
}

// ============================================
// API - توليد QR Code
// ============================================
app.post('/api/generate-qr', [
    body('customerName').optional().isString().trim().escape().isLength({ max: 50 }),
    body('orderDetails').optional().isString().trim().escape().isLength({ max: 100 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                error: 'بيانات غير صحيحة',
                details: errors.array() 
            });
        }

        const { customerName, orderDetails } = req.body;
        const orderId = generateOrderId();
        
        const order = {
            id: orderId,
            number: orderCounter,
            customerName: customerName?.trim() || 'عميل',
            orderDetails: orderDetails?.trim() || 'طلب مقهى',
            status: 'waiting',
            timestamp: new Date().toISOString(),
            qrCode: '',
            token: generateToken(orderId),
            sessionId: req.session.id,
            ip: req.ip
        };

        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const orderUrl = `${baseUrl}?order=${orderId}&token=${order.token}`;
        
        order.qrCode = await QRCode.toDataURL(orderUrl);
        orders.set(orderId, order);
        
        res.json({
            success: true,
            order: {
                id: order.id,
                number: order.number,
                customerName: order.customerName,
                orderDetails: order.orderDetails,
                status: order.status,
                timestamp: order.timestamp
            },
            qrCode: order.qrCode,
            orderUrl: orderUrl
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            success: false, 
            error: process.env.NODE_ENV === 'production' ? 'حدث خطأ داخلي' : error.message 
        });
    }
});

// ============================================
// API - الحصول على طلب
// ============================================
app.get('/api/order/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const token = req.query.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = verifyToken(token);
            if (!decoded || decoded.orderId !== orderId) {
                return res.status(401).json({ success: false, error: 'غير مصرح' });
            }
        }
        
        const order = orders.get(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }
        
        res.json({ 
            success: true, 
            order: {
                id: order.id,
                number: order.number,
                customerName: order.customerName,
                orderDetails: order.orderDetails,
                status: order.status,
                timestamp: order.timestamp,
                qrCode: order.qrCode
            }
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ داخلي' });
    }
});

// ============================================
// API - الطلبات النشطة
// ============================================
app.get('/api/orders/active', (req, res) => {
    try {
        if (!req.session || !req.session.id) {
            return res.status(401).json({ success: false, error: 'غير مصرح' });
        }
        
        const activeOrders = Array.from(orders.values())
            .filter(order => order.status !== 'completed')
            .sort((a, b) => a.number - b.number)
            .map(order => ({
                id: order.id,
                number: order.number,
                customerName: order.customerName,
                orderDetails: order.orderDetails,
                status: order.status,
                timestamp: order.timestamp
            }));
        
        res.json({ success: true, orders: activeOrders });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ داخلي' });
    }
});

// ============================================
// API - تحديث حالة الطلب
// ============================================
app.post('/api/update-status', [
    body('orderId').isString().trim().escape(),
    body('newStatus').isIn(['waiting', 'preparing', 'ready', 'completed'])
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'بيانات غير صحيحة' });
        }
        
        const { orderId, newStatus } = req.body;
        
        if (!req.session || !req.session.id) {
            return res.status(401).json({ success: false, error: 'غير مصرح' });
        }
        
        const order = orders.get(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }
        
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        orders.set(orderId, order);
        
        console.log(`📦 Order ${orderId}: ${newStatus}`);
        
        // تحديث عبر Socket.io
        io.to(orderId).emit('order-status', {
            id: order.id,
            number: order.number,
            customerName: order.customerName,
            orderDetails: order.orderDetails,
            status: order.status,
            timestamp: order.timestamp,
            updatedAt: order.updatedAt
        });
        
        // تحديث البارستا
        const activeOrders = Array.from(orders.values())
            .filter(o => o.status !== 'completed')
            .sort((a, b) => a.number - b.number)
            .map(o => ({
                id: o.id,
                number: o.number,
                customerName: o.customerName,
                orderDetails: o.orderDetails,
                status: o.status,
                timestamp: o.timestamp
            }));
        io.emit('orders-update', activeOrders);
        
        res.json({ 
            success: true, 
            message: 'تم تحديث الحالة',
            order: { id: order.id, number: order.number, status: order.status }
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: 'حدث خطأ داخلي' });
    }
});

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
// API - إرسال إشعار "جاهز"
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
// Socket.io
// ============================================
io.on('connection', (socket) => {
    console.log('🟢 New client:', socket.id);
    
    socket.on('join-order', (orderId) => {
        const order = orders.get(orderId);
        if (!order) {
            socket.emit('error', { message: 'الطلب غير موجود' });
            return;
        }
        
        socket.join(orderId);
        console.log(`📱 Joined: ${orderId}`);
        
        socket.emit('order-status', {
            id: order.id,
            number: order.number,
            customerName: order.customerName,
            orderDetails: order.orderDetails,
            status: order.status,
            timestamp: order.timestamp,
            updatedAt: order.updatedAt
        });
    });
    
    socket.on('update-order-status', ({ orderId, newStatus }) => {
        const order = orders.get(orderId);
        if (!order) {
            socket.emit('error', { message: 'الطلب غير موجود' });
            return;
        }
        
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        orders.set(orderId, order);
        
        console.log(`📦 Socket update: ${orderId} → ${newStatus}`);
        
        io.to(orderId).emit('order-status', {
            id: order.id,
            number: order.number,
            customerName: order.customerName,
            orderDetails: order.orderDetails,
            status: order.status,
            timestamp: order.timestamp,
            updatedAt: order.updatedAt
        });
        
        const activeOrders = Array.from(orders.values())
            .filter(o => o.status !== 'completed')
            .sort((a, b) => a.number - b.number)
            .map(o => ({
                id: o.id,
                number: o.number,
                customerName: o.customerName,
                orderDetails: o.orderDetails,
                status: o.status,
                timestamp: o.timestamp
            }));
        io.emit('orders-update', activeOrders);
    });
    
    socket.on('get-active-orders', () => {
        const activeOrders = Array.from(orders.values())
            .filter(order => order.status !== 'completed')
            .sort((a, b) => a.number - b.number)
            .map(o => ({
                id: o.id,
                number: o.number,
                customerName: o.customerName,
                orderDetails: o.orderDetails,
                status: o.status,
                timestamp: o.timestamp
            }));
        socket.emit('orders-update', activeOrders);
    });
    
    socket.on('disconnect', () => {
        console.log('🔴 Disconnected:', socket.id);
    });
});

// ============================================
// تشغيل السيرفر
// ============================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🔥 Firebase Notifications Enabled`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`👤 Customer: http://localhost:${PORT}/index.html`);
    console.log(`🧪 Test: http://localhost:${PORT}/simple.html`);
    
    console.log('\n📱 للوصول من الجوال:');
    const interfaces = os.networkInterfaces();
    for (const [name, ifaceList] of Object.entries(interfaces)) {
        for (const iface of ifaceList) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`   ➜ http://${iface.address}:${PORT}/index.html`);
            }
        }
    }
    console.log('\n💡 أضف الصفحة للشاشة الرئيسية لتفعيل الإشعارات');
});
