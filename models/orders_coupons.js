const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class OrdersCoupons extends Model { }

OrdersCoupons.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    orderId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },

    couponId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    couponCode: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    type: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    couponValue: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'ordersCoupons',
    timestamps: false,
});


module.exports = OrdersCoupons;