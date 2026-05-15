const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    method: {
        type: DataTypes.ENUM('Card', 'EFT', 'Cash', 'Wallet'),
        defaultValue: 'Card'
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Successful', 'Failed', 'Refunded'),
        defaultValue: 'Successful'
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'payments',
    timestamps: true
});

module.exports = Payment;
