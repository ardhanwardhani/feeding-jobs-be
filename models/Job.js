const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    workType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    locations: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bulletPoints: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    listingDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    tag: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'jobs',
    timestamps: false
});

module.exports = Job;