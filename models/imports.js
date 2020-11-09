const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Imports extends Model { }

Imports.init({
    path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    success: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    error: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    logs: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "imports"
})

module.exports = Imports;