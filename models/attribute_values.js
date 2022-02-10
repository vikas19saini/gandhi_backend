const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class AttributeValues extends Model { }

AttributeValues.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
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
        defaultValue: 0,
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "attributeValues",
    paranoid: true
});

module.exports = AttributeValues;