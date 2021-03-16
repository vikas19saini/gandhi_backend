const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Payments extends Model { }

Payments.init({
    orderId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    transactionNo: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING(5),
        allowNull: true
    },
    additionalLinks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(225),
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "payments",
});

module.exports = Payments;