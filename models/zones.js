const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Zones extends Model { }

Zones.init({
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    countryId: {
        type: DataTypes.BIGINT
    }
}, {
    sequelize: seqConnection,
    timestamps: false,
    underscored: true,
    modelName: 'zones'
})

module.exports = Zones;