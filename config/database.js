require('dotenv').config();
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false
});

sequelize.authenticate()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch((error) => console.error('Unable to connect to the database', error))

module.exports = sequelize;