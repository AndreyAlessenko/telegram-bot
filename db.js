const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    't_bot',
    'root',
    'root',
    {
        host: '5.189.237.172',
        port: '6432',
        dialect: 'postgres'
    }
)