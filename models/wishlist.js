const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Wishlists extends Model { }

Wishlists.init({
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "wishlist",
    paranoid: true
});

module.exports = Wishlists;