require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const pool    = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

app.get('/', (req, res) => res.redirect('/index/index.html'));
app.get('/admin', (req, res) => res.redirect('/admin/login.html'));

// Test DB on startup
pool.query('SELECT 1')
    .then(() => console.log('MySQL connected successfully'))
    .catch(err => { console.error('MySQL connection error:', err.message); process.exit(1); });

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});
