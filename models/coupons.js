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
            min: 1
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
        allowNull: false
    },
    maxSpend: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    individualOnly: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    excludeSaleItems: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    limitPerUser: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "coupons"
});

module.exports = Coupons;