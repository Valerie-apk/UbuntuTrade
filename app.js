require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const multer  = require('multer');
const { execFile } = require('child_process');
const pool    = require('./config/db');

const upload = multer({
    dest: path.join(__dirname, 'uploads'),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype));
    }
    
});

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// POST /api/upload  — single image upload, returns { url }
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }[req.file.mimetype] || '.jpg';
    const fs   = require('fs');
    const newPath = req.file.path + ext;
    fs.renameSync(req.file.path, newPath);
    res.json({ url: '/uploads/' + path.basename(newPath) });
});

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/pay',      require('./routes/payments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/info',         require('./routes/info'));

// Serve the PHP privacy policy by executing it with the PHP CLI
app.get('/privacy-policy', (req, res) => {
    const phpFile = path.join(__dirname, 'index', 'privacy-policy.php');
    execFile('php', [phpFile], (err, stdout, stderr) => {
        if (err) {
            console.error('PHP error:', stderr);
            return res.status(500).send('<h2>Privacy Policy unavailable — PHP is not installed on this server.</h2><p><a href="/">Back to Home</a></p>');
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(stdout);
    });
});

app.get('/', (req, res) => res.redirect('/index/index.html'));
app.get('/admin', (req, res) => res.redirect('/admin/login.html'));

// Test DB on startup
pool.query('SELECT 1')
    .then(() => console.log('MySQL connected successfully'))
    .catch(err => { console.error('MySQL connection error:', err.message); process.exit(1); });

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});
