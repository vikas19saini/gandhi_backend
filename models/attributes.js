const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Attributes extends Model { }

Attributes.init({
    name: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    thName: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    viName: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "attributes",
    paranoid: true
});

module.exports = Attributes;