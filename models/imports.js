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
        allowNull: true,
        defaultValue: 0
    },
    success: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    error: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    updated: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
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