const {Sequelize} = require('sequelize');

const dotenv = require('dotenv');
dotenv.config();
const username = process.env.DATABASE_USER;
const host = process.env.HOST;
const database = process.env.DATABASE;
const password = process.env.PASSWORD;
const port = process.env.PORT;

const sequelize = new Sequelize(database, username, password, {dialect: 'postgres', host: host});

module.exports = sequelize;