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
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "lengthClasses",
    timestamps: false
});

module.exports = LengthClasses;