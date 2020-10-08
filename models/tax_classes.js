const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class TaxClasses extends Model { }

TaxClasses.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "taxClasses"
});


module.exports = TaxClasses;