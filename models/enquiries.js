const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Enquiries extends Model { }

Enquiries.init({
    name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(12),
        allowNull: true,
    },
    message: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(10),
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "enquiries"
});

module.exports = Enquiries;