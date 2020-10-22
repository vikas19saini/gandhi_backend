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
    discount_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate:{
            min:1
        }

    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    min_spend: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    max_spend: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    individual_only: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    exclude_sale_items: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    limit_per_user: {
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
    modelName: "coupons",
    timestamps: false
});

module.exports = Coupons;