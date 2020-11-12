const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Settings extends Model { }

Settings.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'settings',
    timestamps: false
});

module.exports = Settings;