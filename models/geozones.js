const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class GeoZones extends Model { }

GeoZones.init({
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    paranoid: true,
    underscored: true,
    modelName: 'geozone'
});

module.exports = GeoZones;