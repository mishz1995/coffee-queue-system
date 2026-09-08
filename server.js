const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const os = require('os');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ====== إعداد الجلسات ======
app.use(session({
    secret: process.env.SESSION_SECRET || '7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// ====== الميدلوير ======
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== إعداد تخزين الصور ======
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const shopId = req.session.shopId || 'default';
        const shopUploadDir = path.join(uploadDir, shopId);
        if (!fs.existsSync(shopUploadDir)) {
            fs.mkdirSync(shopUploadDir, { recursive: true });
        }
        cb(null, shopUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `banner${ext}`);
    }
});
const upload = multer({ storage: storage });

// ====== قراءة وكتابة بيانات المقاهي ======
const SHOP_DATA_FILE = path.join(__dirname, 'shop-data.json');

function readShops() {
    try {
        if (fs.existsSync(SHOP_DATA_FILE)) {
            const data = fs.readFileSync(SHOP_DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
        return { shops: [] };
    } catch (error) {
        console.error('Error reading shops:', error);
        return { shops: [] };
    }
}

function writeShops(data) {
    try {
        fs.writeFileSync(SHOP_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing shops:', error);
    }
}

// ====== إنشاء مدير افتراضي ======
function ensureAdminExists() {
    const data = readShops();
    const adminExists = data.shops.find(s => s.username === 'admin');
    if (!adminExists) {
        data.shops.push({
            id: 'shop_admin',
            name: 'المدير العام',
            username: 'admin',
            password: 'admin123',
            isActive: true,
            isAdmin: true,
            googleMapsUrl: '',
            bannerImage: null,
            createdAt: new Date().toISOString()
        });
        writeShops(data);
        console.log('✅ Admin account created: admin / admin123');
    }
}
ensureAdminExists();

// ====== تخزين الطلبات ======
const orders = new Map();
let orderCounter = 1000;

// ====== مسارات المصادقة ======
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = readShops();
    const shop = data.shops.find(s => s.username === username && s.password === password);
    
    if (shop) {
        req.session.shopId = shop.id;
        req.session.shopName = shop.name;
        req.session.isAdmin = shop.isAdmin || false;
        res.json({ 
            success: true, 
            shop: { 
                id: shop.id, 
                name: shop.name,
                isAdmin: shop.isAdmin || false
            } 
        });
    } else {
        res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/current-shop', (req, res) => {
    if (req.session.shopId) {
        const data = readShops();
        const shop = data.shops.find(s => s.id === req.session.shopId);
        if (shop) {
            res.json({ success: true, shop });
        } else {
            res.status(401).json({ success: false, error: 'المقهى غير موجود' });
        }
    } else {
        res.status(401).json({ success: false, error: 'غير مسجل الدخول' });
    }
});

// ====== Middleware للتحقق من المصادقة ======
function authenticateShop(req, res, next) {
    if (!req.session.shopId) {
        return res.status(401).json({ success: false, error: 'الرجاء تسجيل الدخول أولاً' });
    }
    const data = readShops();
    const shop = data.shops.find(s => s.id === req.session.shopId);
    if (!shop) {
        return res.status(403).json({ success: false, error: 'المقهى غير موجود' });
    }
    if (!shop.isActive && !shop.isAdmin) {
        return res.status(403).json({ success: false, error: 'المقهى موقف حالياً' });
    }
    req.shop = shop;
    next();
}

function authenticateAdmin(req, res, next) {
    authenticateShop(req, res, () => {
        if (!req.shop.isAdmin) {
            return res.status(403).json({ success: false, error: 'غير مصرح بهذه العملية' });
        }
        next();
    });
}

// ====== مسارات المدير ======
app.get('/api/admin/shops', authenticateAdmin, (req, res) => {
    const data = readShops();
    const shops = data.shops.map(s => {
        const { password, ...rest } = s;
        return rest;
    });
    res.json({ success: true, shops });
});

app.post('/api/admin/shops', authenticateAdmin, (req, res) => {
    const { name, username, password, googleMapsUrl } = req.body;
    const data = readShops();
    
    if (data.shops.find(s => s.username === username)) {
        return res.status(400).json({ success: false, error: 'اسم المستخدم موجود بالفعل' });
    }
    
    const newShop = {
        id: `shop_${Date.now()}`,
        name,
        username,
        password,
        isActive: true,
        isAdmin: false,
        googleMapsUrl: googleMapsUrl || 'https://g.page/your-coffee-shop/review',
        bannerImage: null,
        createdAt: new Date().toISOString()
    };
    
    data.shops.push(newShop);
    writeShops(data);
    
    const { password: _, ...shopData } = newShop;
    res.json({ success: true, shop: shopData });
});

app.post('/api/admin/shops/:shopId/toggle', authenticateAdmin, (req, res) => {
    const { shopId } = req.params;
    const data = readShops();
    const shop = data.shops.find(s => s.id === shopId);
    
    if (!shop) {
        return res.status(404).json({ success: false, error: 'المقهى غير موجود' });
    }
    if (shop.isAdmin) {
        return res.status(403).json({ success: false, error: 'لا يمكن تعطيل حساب المدير' });
    }
    
    shop.isActive = !shop.isActive;
    writeShops(data);
    res.json({ success: true, shop });
});

app.delete('/api/admin/shops/:shopId', authenticateAdmin, (req, res) => {
    const { shopId } = req.params;
    const data = readShops();
    const shop = data.shops.find(s => s.id === shopId);
    
    if (!shop) {
        return res.status(404).json({ success: false, error: 'المقهى غير موجود' });
    }
    if (shop.isAdmin) {
        return res.status(403).json({ success: false, error: 'لا يمكن حذف حساب المدير' });
    }
    
    data.shops = data.shops.filter(s => s.id !== shopId);
    writeShops(data);
    res.json({ success: true });
});

// ====== إعدادات المقهى ======
app.post('/api/shop/settings', authenticateShop, (req, res) => {
    const { googleMapsUrl } = req.body;
    const data = readShops();
    const shop = data.shops.find(s => s.id === req.session.shopId);
    
    if (!shop) {
        return res.status(404).json({ success: false, error: 'المقهى غير موجود' });
    }
    
    shop.googleMapsUrl = googleMapsUrl || 'https://g.page/your-coffee-shop/review';
    writeShops(data);
    res.json({ success: true, shop });
});

// ====== رفع البانر ======
app.post('/api/upload-banner', authenticateShop, upload.single('bannerImage'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'لم يتم رفع أي صورة' });
        }
        
        const imageUrl = `/uploads/${req.session.shopId}/${req.file.filename}`;
        
        const data = readShops();
        const shop = data.shops.find(s => s.id === req.session.shopId);
        if (shop) {
            shop.bannerImage = imageUrl;
            writeShops(data);
        }
        
        io.to(`shop_${req.session.shopId}`).emit('banner-updated', { imageUrl });
        
        res.json({
            success: true,
            imageUrl: imageUrl,
            message: 'تم تحديث البانر بنجاح!'
        });
    } catch (error) {
        console.error('Error uploading banner:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/current-banner', authenticateShop, (req, res) => {
    res.json({ success: true, imageUrl: req.shop.bannerImage || null });
});

// ====== معلومات المقهى للعميل ======
app.get('/api/shop-info/:shopId', (req, res) => {
    const { shopId } = req.params;
    const data = readShops();
    const shop = data.shops.find(s => s.id === shopId);
    
    if (!shop) {
        return res.status(404).json({ success: false, error: 'المقهى غير موجود' });
    }
    
    res.json({ 
        success: true, 
        shop: {
            id: shop.id,
            name: shop.name,
            googleMapsUrl: shop.googleMapsUrl,
            bannerImage: shop.bannerImage
        }
    });
});

// ====== مسارات الطلبات ======
app.post('/api/generate-qr', authenticateShop, async (req, res) => {
    try {
        const { customerName, orderDetails } = req.body;
        const orderNumber = ++orderCounter;
        const orderId = `ORD-${orderNumber}`;
        const shopId = req.session.shopId;
        
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const orderUrl = `${baseUrl}?order=${orderId}&shop=${shopId}`;
        
        const qrCode = await QRCode.toDataURL(orderUrl);
        
        const order = {
            id: orderId,
            number: orderNumber,
            customerName: customerName || 'عميل',
            orderDetails: orderDetails || 'طلب مقهى',
            status: 'waiting',
            timestamp: new Date().toISOString(),
            shopId: shopId,
            qrCode: qrCode
        };
        
        orders.set(orderId, order);
        
        io.to(`shop_${shopId}`).emit('new-order-created', order);
        
        res.json({
            success: true,
            order: order,
            qrCode: qrCode,
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

app.get('/api/orders/active', authenticateShop, (req, res) => {
    const shopId = req.session.shopId;
    const activeOrders = Array.from(orders.values())
        .filter(order => order.shopId === shopId && order.status !== 'completed')
        .sort((a, b) => a.number - b.number);
    
    res.json({ success: true, orders: activeOrders });
});

// ====== صفحات مخصصة ======
app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/qr.html'));
});

app.get('/service-worker.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'public/service-worker.js'));
});

// ====== Socket.io ======
io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);
    
    socket.on('join-shop', (shopId) => {
        socket.join(`shop_${shopId}`);
        console.log(`📱 Client joined shop room: ${shopId}`);
    });
    
    socket.on('join-order', (orderId) => {
        socket.join(orderId);
        console.log(`📱 Client joined order room: ${orderId}`);
    });
    
    socket.on('leave-order', (orderId) => {
        socket.leave(orderId);
        console.log(`📱 Client left order room: ${orderId}`);
    });
    
    socket.on('update-order-status', ({ orderId, newStatus }, callback) => {
        const order = orders.get(orderId);
        if (!order) {
            if (callback) callback({ success: false, error: 'Order not found' });
            return;
        }
        
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        orders.set(orderId, order);
        
        console.log(`📦 Order ${orderId} status updated to: ${newStatus}`);
        
        io.to(orderId).emit('order-status', order);
        io.to(`shop_${order.shopId}`).emit('order-status-update', order);
        
        const activeOrders = Array.from(orders.values())
            .filter(o => o.shopId === order.shopId && o.status !== 'completed')
            .sort((a, b) => a.number - b.number);
        io.to(`shop_${order.shopId}`).emit('orders-update', activeOrders);
        
        if (callback) callback({ success: true });
    });
    
    socket.on('get-active-orders', (shopId) => {
        const activeOrders = Array.from(orders.values())
            .filter(order => order.shopId === shopId && order.status !== 'completed')
            .sort((a, b) => a.number - b.number);
        socket.emit('orders-update', activeOrders);
    });
    
    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
    });
});

// ====== تشغيل السيرفر ======
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
    console.log(`📋 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`👤 Customer: http://localhost:${PORT}/index.html`);
    console.log(`🖥️  QR Screen: http://localhost:${PORT}/qr`);
    console.log(`🏢 Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`\n🔑 Default Admin: admin / admin123`);
    
    console.log('\n📱 للوصول من الجوال:');
    const interfaces = os.networkInterfaces();
    for (const [name, ifaceList] of Object.entries(interfaces)) {
        for (const iface of ifaceList) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`   ➜ http://${iface.address}:${PORT}/qr`);
            }
        }
    }
});
