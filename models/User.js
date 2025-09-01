const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Role = require('./Role');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    displayname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    twoFaSecret: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isTwoFaEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    roleId: {
        type: DataTypes.STRING,
        defaultValue: 'USER',
        references: {
            model: Role,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

module.exports = User;