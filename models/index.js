const User = require('./user');
const Product = require('./Product');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Conversation = require('./Conversation');
const Message = require('./Message');
const WishlistItem = require('./WishlistItem');

User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'userId', as: 'seller' });

User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Conversation, { foreignKey: 'buyerId', as: 'buyingConversations' });
User.hasMany(Conversation, { foreignKey: 'sellerId', as: 'sellingConversations' });
Conversation.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Conversation.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Conversation.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(WishlistItem, { foreignKey: 'userId', as: 'wishlistItems' });
WishlistItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(WishlistItem, { foreignKey: 'productId', as: 'wishlistItems' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
    User,
    Product,
    CartItem,
    Order,
    OrderItem,
    Payment,
    Conversation,
    Message,
    WishlistItem
};
