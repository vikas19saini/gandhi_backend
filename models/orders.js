const { DataTypes, Model } = require("sequelize");
const { sendOrderEmail } = require("../mailers/mailer");
const Carts = require("./carts");
const CartProducts = require("./cart_products");
const seqConnection = require("./connection");
const OrdersHistories = require("./orders_histories");
const Products = require("./products");
const Uploads = require("./uploads");

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
    trackingNo: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    shipBy: {
        type: DataTypes.STRING(225),
        allowNull: true
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
                args: [[0, 1, 2, 3, 4, 5, 6]], // 0 - Processing, 1 - Packed, 2 - Shipped, 3 - delivered, 4 - Refunded, 5 - Cancelled, 6 - Payment Fail
                msg: "Invalid status"
            }
        }
    },
    statusName: {
        type: new DataTypes.VIRTUAL,
        get: function () {
            if (!this.status) {
                return "Processing";
            } else if (this.status === 1) {
                return "Packed";
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
    paranoid: true
});

Orders.afterCreate(async (orderInstance) => {
    try {
        let order = await getOrder(orderInstance.id);
        sendOrderEmail(order);
        let cartId = order.referenceNo.split("/")[1];

        // Saving order history
        await saveOrderHistory(order);

        // Deleting rows from cart table
        await Carts.destroy({ where: { id: parseInt(cartId) } });
        await CartProducts.destroy({ where: { cartId: parseInt(cartId) } });

    } catch (err) {
        console.log(err);
    }
});

Orders.beforeUpdate(async (order) => {
    if (order.status === order.previous('status')) {
        throw new Error("Same status can't update");
    }
});

Orders.afterUpdate(async (orderInstance) => {
    let order = await getOrder(orderInstance.id);
    await saveOrderHistory(orderInstance);
    sendOrderEmail(order);

    if (order.status === 4 || order.status === 5) {
        await releaseQuantity(order);
    }
});

async function getOrder(orderId) {
    return await Orders.findByPk(orderId, {
        include: [{
            model: Products,
            as: "products",
            include: [
                {
                    model: Uploads,
                    as: "featuredImage"
                }
            ]
        }, "shippingAddress", "user"]
    });
}

async function saveOrderHistory(order) {
    let text = "";
    if (order.status === 0) {
        text = "Order placed and payment captured. Email sent to customer";
    } else if (order.status === 1) {
        text = "Order packed, all items marked as fullfilled, email sent to customer.";
    } else if (order.status === 2) {
        text = "Order shipped, email sent to customer.";
    } else if (order.status === 3) {
        text = "Order successfully delivered, email sent to customer.";
    } else if (order.status === 4) {
        text = "Refund generated to the customer, email sent to customer.";
    } else if (order.status === 5) {
        text = "Order cancelled, email sent to customer.";
    } else if (order.status === 6) {
        text = "Payment fail or payment declined by the payment method.";
    }
    await OrdersHistories.create({
        orderId: order.id,
        status: order.status,
        text: text
    });
}

async function releaseQuantity(order) {
    for(let product of order.products){
        product.releaseQuantity();
    }
}

module.exports = Orders;