const DataTypes = require('sequelize');
const sequelize = require('../util/database');

const OrderItem = sequelize.define('orderitem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: DataTypes.INTEGER
});

module.exports = OrderItem;