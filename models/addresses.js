const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Addresses extends Model { }

Addresses.init({
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    countryId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    zoneId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    postcode: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    isDefault: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "addresses"
});

module.exports = Addresses;