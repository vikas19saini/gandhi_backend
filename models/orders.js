const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Orders extends Model { }

Orders.init({
    userId: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        unique: true
    },
    referenceNo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    shippingAddressId: {
        type: DataTypes.BIGINT(20),
        allowNull: false
    },
    billingAddressId: {
        type: DataTypes.BIGINT(20),
        allowNull: true
    },
    currencyCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
    },
    currencyValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    orderValue: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    couponDiscount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    shippingCharges: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    paymentMethod: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    shippingMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    total: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1, 2, 3, 4, 5, 6]], // 0 - Created, 1 - Processing, 2 - Shipped, 3 - delivered, 4 - Refunded, 5 - Cancelled, 6 - Payment Fail
                msg: "Invalid status"
            }
        }
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
    completeAddress: {
        type: new DataTypes.VIRTUAL,
        get: function () {
            if (!this.shippingAddress)
                return;

            let shippingAddress = this.shippingAddress;
            let shippingAddressArr = [];

            /* if (shippingAddress.name)
                shippingAddressArr.push(shippingAddress.name); */

            if (shippingAddress.address)
                shippingAddressArr.push(shippingAddress.address);

            if (shippingAddress.city)
                shippingAddressArr.push(shippingAddress.city);

            if (shippingAddress.zone)
                shippingAddressArr.push(shippingAddress.zone);

            if (shippingAddress.country)
                shippingAddressArr.push(shippingAddress.country);

            if (shippingAddress.postcode)
                shippingAddressArr.push(shippingAddress.postcode);

            /* if (shippingAddress.phone)
                shippingAddressArr.push(shippingAddress.phone); */

            return shippingAddressArr.join(", ");
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "orders",
});

module.exports = Orders;