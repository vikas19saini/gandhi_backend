const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Filters extends Model { }

Filters.init({
    name: {
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
    modelName: "filters",
});

module.exports = Filters;