const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class LengthClasses extends Model { }

LengthClasses.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    isDefault: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "lengthClasses",
    paranoid: true
});

module.exports = LengthClasses;