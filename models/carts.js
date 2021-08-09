const { DataTypes, Model, Op, Sequelize } = require("sequelize");
const { boxes } = require("../controllers/packing_boxes");
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
    paranoid: true,
    scopes: {
        abandoned: {
            where: {
                updatedAt: {
                    [Op.lt]: Sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 HOUR)")
                }
            }
        }
    }
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

Carts.prototype.getShipingParcels = async function (defaultCurrency) {
    try {
        let cart = this;
        let totalNoOfBoxes = boxes.length;

        let weight = 0, allProductsGroup = [[]];
        for (let product of cart.products) {
            weight += product.shippingWeight * product.cartProducts.quantity;
            if (weight <= boxes[totalNoOfBoxes - 1].maxWeight) {
                allProductsGroup[allProductsGroup.length - 1].push(product);
            } else {
                allProductsGroup.push([product]);
            }
        }

        let parcels = allProductsGroup.map((productGroup) => {
            let weight = 0;
            let items = productGroup.map((product) => {
                weight += product.shippingWeight * product.cartProducts.quantity;
                return {
                    description: product.name,
                    origin_country: process.env.STORE_COUNTRY,
                    quantity: Math.floor(product.cartProducts.quantity),
                    price: {
                        amount: product.salePrice ? product.salePrice : product.ragularPrice,
                        currency: defaultCurrency.code
                    },
                    weight: {
                        value: product.shippingWeight,
                        unit: "kg"
                    },
                    sku: product.sku
                }
            });

            weight = Math.ceil(weight)

            let availBoxed = boxes.filter(box => box.maxWeight <= weight);
            let boxLength = availBoxed.length;

            return {
                description: `Custom Box Wight ${weight} Kg`,
                box_type: "custom",
                weight: {
                    unit: "kg",
                    value: weight
                },
                dimension: {
                    unit: "cm",
                    height: availBoxed[boxLength - 1].height,
                    width: availBoxed[boxLength - 1].width,
                    depth: availBoxed[boxLength - 1].depth
                },
                items: items
            };
        });
        return parcels;
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

module.exports = Carts;