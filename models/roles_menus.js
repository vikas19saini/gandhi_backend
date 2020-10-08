const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class RolesMenus extends Model { }

RolesMenus.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    c: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    u: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    r: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
    d: {
        type: DataTypes.TINYINT,
        allowNull: true
    },
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'rolesMenus',
    timestamps: false
});

module.exports = RolesMenus;