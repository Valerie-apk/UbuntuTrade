const router = require('express').Router();

router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UbuntuTrade — Platform Info</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; }
        header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 40px 20px; text-align: center; }
        header h1 { font-size: 2.5rem; margin-bottom: 8px; }
        header h1 span { color: #e07b39; }
        header p { font-size: 1.1rem; opacity: 0.8; }
        .badge { display: inline-block; background: #e07b39; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 12px; }
        .container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
        .card { background: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
        .card h2 { font-size: 1.2rem; margin-bottom: 16px; color: #1a1a2e; border-bottom: 2px solid #e07b39; padding-bottom: 8px; }
        .stack-tags { display: flex; flex-wrap: wrap; gap: 10px; }
        .tag { background: #f0f0f0; padding: 6px 14px; border-radius: 20px; font-size: 14px; color: #444; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 10px 12px; background: #f9f9f9; border-bottom: 2px solid #eee; color: #666; font-size: 13px; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        td:first-child { font-family: monospace; color: #e07b39; font-weight: 500; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
        .info-item label { display: block; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .info-item span { font-weight: 600; font-size: 16px; }
        footer { text-align: center; padding: 30px; color: #999; font-size: 13px; }
    </style>
</head>
<body>
<header>
    <h1>Ubuntu<span>Trade</span></h1>
    <p>Buy &amp; Sell in Your Community</p>
    <span class="badge">v1.0.0 &mdash; Platform Info</span>
</header>
<div class="container">
    <div class="card">
        <h2>Platform Info</h2>
        <div class="info-grid">
            <div class="info-item"><label>Platform</label><span>UbuntuTrade</span></div>
            <div class="info-item"><label>Version</label><span>1.0.0</span></div>
            <div class="info-item"><label>Backend</label><span>Node.js + Express</span></div>
            <div class="info-item"><label>Server Time</label><span id="srvTime"></span></div>
        </div>
    </div>
    <div class="card">
        <h2>Tech Stack</h2>
        <div class="stack-tags">
            <span class="tag">Node.js</span>
            <span class="tag">Express.js</span>
            <span class="tag">MySQL</span>
            <span class="tag">HTML / CSS / JS</span>
        </div>
    </div>
    <div class="card">
        <h2>API Routes (port ${process.env.PORT || 3000})</h2>
        <table>
            <thead><tr><th>Route</th><th>Description</th></tr></thead>
            <tbody>
                <tr><td>POST /api/auth/register</td><td>Register a new user</td></tr>
                <tr><td>POST /api/auth/login</td><td>Login with email &amp; password</td></tr>
                <tr><td>GET  /api/products</td><td>Get all products (search &amp; filter)</td></tr>
                <tr><td>POST /api/products/add</td><td>Add a new product</td></tr>
                <tr><td>GET  /api/products/:id</td><td>Get a single product</td></tr>
                <tr><td>POST /api/cart/add</td><td>Add item to cart</td></tr>
                <tr><td>GET  /api/cart/:userId</td><td>View cart for a user</td></tr>
                <tr><td>POST /api/orders/checkout</td><td>Checkout and create order</td></tr>
                <tr><td>GET  /api/orders/:userId</td><td>View user orders</td></tr>
                <tr><td>POST /api/pay/checkout</td><td>Record payment for an order</td></tr>
                <tr><td>GET  /api/admin/stats</td><td>Platform stats</td></tr>
            </tbody>
        </table>
    </div>
    <div class="card">
        <h2>Database Tables</h2>
        <table>
            <thead><tr><th>Table</th><th>Key Columns</th></tr></thead>
            <tbody>
                <tr><td>users</td><td>id, username, fullName, email, password, role, location</td></tr>
                <tr><td>products</td><td>id, name, price, category, condition, status, userId</td></tr>
                <tr><td>cart_items</td><td>id, userId, productId, quantity</td></tr>
                <tr><td>orders</td><td>id, userId, subtotal, deliveryFee, total, status</td></tr>
                <tr><td>order_items</td><td>id, orderId, productId, productName, unitPrice, lineTotal</td></tr>
                <tr><td>payments</td><td>id, orderId, userId, amount, method, transactionId</td></tr>
                <tr><td>conversations</td><td>id, buyerId, sellerId, productId, lastMessage</td></tr>
                <tr><td>messages</td><td>id, conversationId, senderId, body, isRead</td></tr>
                <tr><td>wishlist_items</td><td>id, userId, productId</td></tr>
            </tbody>
        </table>
    </div>
</div>
<footer>&copy; ${new Date().getFullYear()} UbuntuTrade &mdash; Built with Node.js, Express &amp; MySQL</footer>
<script>document.getElementById('srvTime').textContent = new Date().toLocaleString();</script>
</body>
</html>`);
});

module.exports = router;
