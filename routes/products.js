const router = require('express').Router();
const Product = require('../models/Product');

// POST: /api/products/add (Create a product)
router.post('/add', async (req, res) => {
    try {
        const { name, description, imageUrl, price, category, userId } = req.body;
        
        const newProduct = await Product.create({
            name,
            description,
            // Use imageUrl from body if it exists, otherwise use the default
            imageUrl: imageUrl || 'default-product.png', 
            price,
            category,
            userId // MUST exist in the Users table
        });

        res.status(201).json({ 
            success: true,
            message: "Product created successfully!", 
            data: newProduct 
        });
    } catch (error) {
        // This will catch things like missing fields or Foreign Key errors
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// GET: /api/products (Fetch all from DB)
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: /api/products/:id (Fetch single item)
// Note: Keep this BELOW the /add route so 'add' isn't treated as an ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;