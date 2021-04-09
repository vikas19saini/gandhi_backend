const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class CartProducts extends Model { }

CartProducts.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    cartId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "cartProducts",
    tableName: "cart_products"
});

module.exports = CartProducts;