const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class OrdersHistories extends Model { }

OrdersHistories.init({
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

    status: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    text: {
        type: DataTypes.STRING(500),
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'ordersHistories',
    timestamps: false,
});


module.exports = OrdersHistories;