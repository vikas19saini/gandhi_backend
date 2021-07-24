const { DataTypes, Model } = require("sequelize");
const CartProducts = require("./cart_products");
const seqConnection = require("./connection");

class Carts extends Model { }

Carts.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    couponId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    cartValue: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    couponDiscount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    shippingCost: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    addressId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    shippingMethod: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    eta: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "carts",
    paranoid: true
});

Carts.prototype.deleteShiping = async function () {
    this.shippingCost = 0;
    this.addressId = null;
    this.eta = "";
    await this.save();
}

// Calculating Cart
Carts.prototype.calculateCart = async function () {
    try {
        let cart = this;
        let cartValue = 0, discount = 0, couponDiscount = 0, total = 0;
        for (let cp of cart.products) {
            let productDiscount = 0;
            cartValue += cp.cartProducts.quantity * cp.ragularPrice; // Calculation cart value based on MRP

            if (cp.salePrice === 0) {
                let productDiscountAmount = calculateCouponDiscount(cart, cp);
                total += (cp.cartProducts.quantity * cp.ragularPrice) - productDiscountAmount;
                productDiscount = productDiscountAmount;
                couponDiscount += productDiscountAmount;
            } else {
                total += cp.cartProducts.quantity * cp.salePrice;
                discount += (cp.cartProducts.quantity * cp.ragularPrice) - (cp.cartProducts.quantity * cp.salePrice);
                productDiscount = discount;
            }

            await CartProducts.update({
                discount: productDiscount
            }, {
                where: {
                    id: cp.cartProducts.id
                }
            });
        }

        this.cartValue = cartValue;
        this.discount = discount;
        this.couponDiscount = couponDiscount;
        this.total = this.shippingCost ? this.shippingCost + total : total;
        await this.save();
        return { status: true };
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
}

function calculateCouponDiscount(cart, cp) {
    if (!cart.coupon) return 0;

    if (cart.coupon.discountType === "fixed") {
        return parseFloat((cart.coupon.amount / cart.products.length).toFixed(2));
    }

    if (cart.coupon.discountType === "percentage") {
        return parseFloat((((cp.cartProducts.quantity * cp.ragularPrice) * cart.coupon.amount) / 100).toFixed(2));
    }
}

module.exports = Carts;