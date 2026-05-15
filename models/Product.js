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
    images: {
        type: DataTypes.JSON
    },
    status: {
        type: DataTypes.ENUM('Active', 'Sold', 'Pending', 'Removed'),
        defaultValue: 'Active'
    },
    category: {
        type: DataTypes.STRING
    },
    subcategory: {
        type: DataTypes.STRING
    },
    condition: {
        type: DataTypes.ENUM('Brand New', 'Like New', 'Good', 'Used')
    },
    location: {
        type: DataTypes.STRING
    },
    department: {
        type: DataTypes.STRING
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    soldCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    userId: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'products',
    timestamps: true 
});

module.exports = Product;
