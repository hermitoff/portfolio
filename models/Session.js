const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    expiresAt: {
        type: DataTypes.DATE(3),
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    updatedAt: false,
    createdAt: true
});

module.exports = Session;