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
    statusName: {
        type: new DataTypes.VIRTUAL,
        get: function () {
            if (!this.status) {
                return "Created";
            } else if (this.status === 1) {
                return "Processing";
            } else if (this.status === 2) {
                return "Shipped";
            } else if (this.status === 3) {
                return "Delivered";
            } else if (this.status === 4) {
                return "Refunded";
            } else if (this.status === 5) {
                return "Cancelled";
            } else if (this.status === 6) {
                return "Payment Fail";
            }
        }
    },
    text: {
        type: DataTypes.STRING(500),
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'ordersHistories',
    tableName: "order_history",
    paranoid: true
});


module.exports = OrdersHistories;