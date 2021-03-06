const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class FilterValues extends Model { }

FilterValues.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
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
    modelName: "filterValues",
});

module.exports = FilterValues;