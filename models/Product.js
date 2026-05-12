const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        defaultValue: 'default-product.png'
    },
    status: {
        type: DataTypes.ENUM('Active', 'Sold', 'Pending'),
        defaultValue: 'Active'
    },
    category: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'products',
    timestamps: true 
});

module.exports = Product;