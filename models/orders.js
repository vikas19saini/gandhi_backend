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
        allowNull: false
    },
    billingAddressId: {
        type: DataTypes.BIGINT(20),
        allowNull: true
    },
    currencyCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
    },
    currencyValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    orderValue: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    shippingCharges: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    paymentMethod: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    shippingMethod: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    total: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1, 2, 3, 4, 5]], // 0 - Created, 1 - Processing, 2 - Shipped, 3 - delivered, 4 - Refunded, 5 - Cancelled
                msg: "Invalid status"
            }
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "orders",
});

Orders.afterCreate(order => {
    console.log(order);
})

Orders.afterUpdate(order => {
    console.log(order);
})

module.exports = Orders;