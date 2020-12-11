const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class OrdersAddresses extends Model { }

OrdersAddresses.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    country: {
        type: DataTypes.BIGINT(20),
        allowNull: false
    },

    postcode: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    }



}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'ordersAddresses',
    timestamps: false,
});


module.exports = OrdersAddresses;