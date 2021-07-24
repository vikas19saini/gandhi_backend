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
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0
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
    tableName: "cart_products",
    paranoid: true
});

CartProducts.beforeUpdate(async (cartProduct) => {
    try {
        if (cartProduct.previous("status") === 1) {
            cartProduct.product.releaseCartQuantity(cartProduct.previous('quantity'));
        }
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
});

CartProducts.beforeDestroy(async (cartProduct) => {
    try {
        if (cartProduct.previous("status") === 1) {
            cartProduct.product.releaseCartQuantity(cartProduct.previous('quantity'));
        }
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
});

module.exports = CartProducts;