const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Orders extends Model { }

Orders.init({
    code: {
        type: DataTypes.STRING(225),
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        unique: true
    },
    shippingAddressId: {
        type: DataTypes.BIGINT(20),
        allowNull: true
    },
    billingAddressId: {
        type: DataTypes.BIGINT(20),
        allowNull: true
    },
    currencyCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true
    },
    currencyValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
        unique: true
    },
    orderValue : {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true
    },
    taxValue : {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true
    },
    discount : {
        type: DataTypes.FLOAT,
        allowNull: false,
       
    },
    shippingCharges : {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    shippingMethod: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Invalid status 0 or 1 allowed"
            }
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "orders"
});

module.exports = Orders;