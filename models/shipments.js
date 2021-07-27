const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Shipments extends Model { }

Shipments.init({
    orderId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    shipmentId: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    trackingNumber: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    label: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    invoice: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    manifestId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    chargeWeightValue: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    chargeWeightUnit: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    totalChargeAmount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    totalChargeCurrency: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    serviceName: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    pickupDeadline: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    bookingCutOff: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    deliveryDate: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    transitTime: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    detailedCharges: {
        type: DataTypes.JSON,
        allowNull: true
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    shipDate: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
            isIn: {
                args: [["created", "cancelled", "closed", "manifested"]],
                msg: "Invalid status"
            }
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "shipments",
    paranoid: true
});

module.exports = Shipments;