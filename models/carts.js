const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Carts extends Model { }

Carts.init({
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    quantity: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "carts"
});

module.exports = Carts;