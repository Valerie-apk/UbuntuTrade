const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WishlistItem = sequelize.define('WishlistItem', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'wishlist_items',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'productId']
        }
    ]
});

module.exports = WishlistItem;
