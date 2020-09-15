const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Menus extends Model { }

Menus.init({
    label: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parent: {
        type: DataTypes.BIGINT,
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true
});

module.exports = Menus;