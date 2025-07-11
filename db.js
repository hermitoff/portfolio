const { Sequelize } = require('sequelize');

const config = require('./config')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/database/database.sqlite',
    logging: config.sequelize_logging ? console.log : false,
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('DATABASE: Connection has been established successfully.');
    } catch (error) {
        console.error('DATABASE: Unable to connect to the database.', error);
    }
}

testConnection();

module.exports = sequelize;