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