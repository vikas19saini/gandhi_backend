const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Carts extends Model { }

Carts.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    couponId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    cartValue: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    couponDiscount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    addressId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    shippingMethod: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    eta: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "carts"
});

module.exports = Carts;