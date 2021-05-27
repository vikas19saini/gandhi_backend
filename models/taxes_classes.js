const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");
const TaxClasses = require("./tax_classes");

class TaxesClasses extends Model { }

TaxesClasses.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    priority: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    paranoid: true,
    modelName: "taxesClasses"
});

module.exports = TaxesClasses;