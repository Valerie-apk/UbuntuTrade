const { Sequelize } = require('sequelize');

// was in routes folder 
const dbPass = require('../routes/password'); 


const sequelize = new Sequelize('my_db', 'root', dbPass, { 
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
});

// The connection function
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected successfully via Sequelize');
    } catch (err) {
        console.error('Database Connection Error:', err);
        process.exit(1);
    }
};

// Export both so app.js can find them
module.exports = { connectDB, sequelize };