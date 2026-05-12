const router = require('express').Router();

router.post('/add', (req, res) => {
    res.json({ message: "Added to cart", item: req.body.productId });
});

module.exports = router;