const router = require('express').Router();

router.post('/checkout', (req, res) => {
    res.json({ status: "Payment Successful", transactionId: "TXN_99283" });
});

module.exports = router;