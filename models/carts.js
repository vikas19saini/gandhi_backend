const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Carts extends Model { }

Carts.init({
    userId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    quantity: {
        type: DataTypes.BIGINT,
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "carts"
});

module.exports = Carts;