const express = require('express');
const cors = require('cors'); // 1. Import the cors package
const app = express();

//  import database connection and models
const { connectDB, sequelize } = require('./config/db');

require('./models');
app.use(express.json());

const PORT = 3000;

//  Connect to mysql and sync models
connectDB();
sequelize.sync({ alter: true })
    .then(() => console.log('Database & Tables Synchronized'))
    .catch(err => console.error(' Database Sync Error:', err));

// Root Route
app.get('/', (req, res) => {
    res.send('<h1>Server is up and running!</h1><p>Try the API routes at /api/products</p>');
});

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payments');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pay', paymentRoutes);
app.use('/api/messages', messageRoutes);

app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});
