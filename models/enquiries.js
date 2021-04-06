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
    productId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    tool: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    dateTime: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            isIn: {
                args: [['contact', 'bulk', 'live']],
                msg: "Invalid type value"
            }
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "enquiries"
});

module.exports = Enquiries;