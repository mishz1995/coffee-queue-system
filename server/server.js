const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const os = require('os');
const fs = require('fs'); // ⬅️ جديد
const multer = require('multer'); // ⬅️ جديد (نحتاج تثبيته)

require('dotenv').config();

// ====== إعداد تخزين الصور ======
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `banner${ext}`);
    }
});
const upload = multer({ storage: storage });

// ====== باقي الإعدادات ======
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

// ====== مسار رفع البانر ======
app.post('/api/upload-banner', upload.single('bannerImage'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'لم يتم رفع أي صورة' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
        // بث تحديث البانر لجميع صفحات QR
        io.emit('banner-updated', { imageUrl });
        
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

// ====== مسار جلب البانر الحالي ======
app.get('/api/current-banner', (req, res) => {
    const bannerPath = path.join(uploadDir, 'banner.jpg');
    const bannerPathPng = path.join(uploadDir, 'banner.png');
    
    let imageUrl = null;
    if (fs.existsSync(bannerPath)) {
        imageUrl = '/uploads/banner.jpg';
    } else if (fs.existsSync(bannerPathPng)) {
        imageUrl = '/uploads/banner.png';
    }
    
    res.json({ success: true, imageUrl });
});

// ====== باقي المسارات (API و Socket.io) ======
// ... (أضف الكود القديم هنا) ...
