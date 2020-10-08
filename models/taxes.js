const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Taxes extends Model { }

Taxes.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rate: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM,
        values: ["P", "F"]
    },
    geozoneId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "taxes"
});

module.exports = Taxes;