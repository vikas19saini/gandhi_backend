const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class GeoZonesZones extends Model { }

GeoZonesZones.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'geozonesZones',
    paranoid: true
})

module.exports = GeoZonesZones;