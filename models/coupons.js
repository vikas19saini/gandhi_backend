const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Coupons extends Model { }

Coupons.init({
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    discountType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: {
                args: 1,
                msg: "Please set Amount"
            }
        }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    minSpend: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    maxSpend: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    individualOnly: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: true
    },
    excludeSaleItems: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: true
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    limitPerUser: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "coupons"
});

module.exports = Coupons;