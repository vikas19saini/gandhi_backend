const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class OrdersProducts extends Model { }

OrdersProducts.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    orderId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    ragularPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    salePrice: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    tax: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    tax_value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tax_rate: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }

}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'ordersProducts',
    timestamps: false,
});


module.exports = OrdersProducts;