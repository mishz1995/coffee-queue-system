const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const os = require('os');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const orders = new Map();
let orderCounter = 1000;

app.get('/service-worker.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, '../public/service-worker.js'));
});

app.post('/api/generate-qr', async (req, res) => {
    try {
        const { customerName, orderDetails } = req.body;
        const orderNumber = ++orderCounter;
        const orderId = `ORD-${orderNumber}`;
        
        const order = {
            id: orderId,
            number: orderNumber,
            customerName: customerName || 'عميل',
            orderDetails: orderDetails || 'طلب مقهى',
            status: 'waiting',
            timestamp: new Date().toISOString(),
            qrCode: ''
        };

        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const orderUrl = `${baseUrl}?order=${orderId}`;
        
        order.qrCode = await QRCode.toDataURL(orderUrl);
        
        orders.set(orderId, order);
        
        res.json({
            success: true,
            order: order,
            qrCode: order.qrCode,
            orderUrl: orderUrl
        });
    } catch (error) {
        console.error('Error generating QR:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/order/:orderId', (req, res) => {
    const { orderId } = req.params;
    const order = orders.get(orderId);
    
    if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, order });
});

app.get('/api/orders/active', (req, res) => {
    const activeOrders = Array.from(orders.values())
        .filter(order => order.status !== 'completed')
        .sort((a, b) => a.number - b.number);
    
    res.json({ success: true, orders: activeOrders });
});

io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);
    
    socket.on('join-order', (orderId) => {
        socket.join(orderId);
        console.log(`📱 Client joined room: ${orderId}`);
        
        const order = orders.get(orderId);
        if (order) {
            socket.emit('order-status', order);
        } else {
            socket.emit('error', { message: 'Order not found' });
        }
    });
    
    socket.on('update-order-status', ({ orderId, newStatus }) => {
        const order = orders.get(orderId);
        if (!order) {
            socket.emit('error', { message: 'Order not found' });
            return;
        }
        
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        orders.set(orderId, order);
        
        console.log(`📦 Order ${orderId} status updated to: ${newStatus}`);
        
        io.to(orderId).emit('order-status', order);
        
        const activeOrders = Array.from(orders.values())
            .filter(o => o.status !== 'completed')
            .sort((a, b) => a.number - b.number);
        io.emit('orders-update', activeOrders);
    });
    
    socket.on('get-active-orders', () => {
        const activeOrders = Array.from(orders.values())
            .filter(order => order.status !== 'completed')
            .sort((a, b) => a.number - b.number);
        socket.emit('orders-update', activeOrders);
    });
    
    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
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