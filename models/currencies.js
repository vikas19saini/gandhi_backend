const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Currencies extends Model { }

Currencies.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'currencies'
})

module.exports = Currencies;