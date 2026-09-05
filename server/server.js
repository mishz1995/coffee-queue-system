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

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:"],
        },
    },
}));

app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '⚠️ عدد الطلبات كبير جداً، حاول مرة أخرى بعد 15 دقيقة',
});
app.use('/api/', limiter);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================
// 📂 ملفات ثابتة
// ============================================
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// 📦 التخزين
// ============================================
const orders = new Map();
let orderCounter = 1000;

// ============================================
// 🔑 دوال مساعدة
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

// ============================================
// 🆕 API - إنشاء طلب
// ============================================
app.post('/api/generate-qr', [
    body('customerName').optional().isString().trim().escape().isLength({ max: 50 }),
    body('orderDetails').optional().isString().trim().escape().isLength({ max: 100 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'بيانات غير صحيحة' });
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
            token: generateToken(orderId)
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
        res.status(500).json({ success: false, error: 'حدث خطأ داخلي' });
    }
});

// ============================================
// 📋 API - الحصول على طلب
// ============================================
app.get('/api/order/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const token = req.query.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
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
// 📊 API - الطلبات النشطة
// ============================================
app.get('/api/orders/active', (req, res) => {
    try {
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
// 🔄 API - تحديث حالة الطلب
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
        const order = orders.get(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }
        
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        orders.set(orderId, order);
        
        console.log(`📦 Order ${orderId}: ${newStatus}`);
        
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
// 🔌 Socket.io
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
// 🚀 تشغيل السيرفر
// ============================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`👤 Customer: http://localhost:${PORT}/index.html`);
});
