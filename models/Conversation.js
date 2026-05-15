const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
    productId: {
        type: DataTypes.INTEGER
    },
    buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lastMessage: {
        type: DataTypes.TEXT
    },
    unreadForBuyer: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    unreadForSeller: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'conversations',
    timestamps: true
});

module.exports = Conversation;
