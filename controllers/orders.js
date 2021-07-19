const route = require("express").Router();
const seqConnection = require("../models/connection");
const { Currencies, Addresses, Carts, Orders, OrderAddresses, Products, Payments, OrdersHistories, Coupons, OrdersProducts, OrdersCoupons } = require("../models/index");
const CartProducts = require("../models/cart_products");
const { isAuthenticated } = require("../middleware/auth");

route.get("/", [isAuthenticated], async (req, res) => {
    Orders.findAll({
        where: { userId: req.userId },
        order: [["id", "desc"]],
        include: [
            {
                model: Products,
                as: "products",
                attributes: ["id", "slug"],
                include: ["featuredImage"],
                required: false
            },
            {
                model: OrderAddresses,
                as: "shippingAddress"
            },
            {
                model: Coupons,
                as: "coupons"
            },
            {
                model: OrdersHistories,
                as: "histories"
            },
            {
                model: Payments,
                as: "payments"
            }
        ]
    }).then(data => {
        return res.json(data);
    }).catch(err => {
        return res.status(500).json(err);
    })
});

route.post("/payment", [isAuthenticated], (req, res) => {
    Payments.create(req.body)
        .then((data) => {
            return res.status(200).json({ message: "Payment details saved" });
        }).catch((err) => {
            console.log(err);
            return res.status(400).json(err);
        });
});

route.get("/:orderId", [isAuthenticated], async (req, res) => {
    Orders.findByPk(req.params.orderId, {
        include: [
            {
                model: Products,
                as: "products",
                attributes: ["id"],
                include: ["featuredImage"]
            },
            {
                model: OrderAddresses,
                as: "shippingAddress"
            },
            {
                model: Payments,
                as: "payments"
            },
            {
                model: OrdersHistories,
                as: "histories"
            }
        ]
    }).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json(err);
    })
});

route.post("/", [isAuthenticated], async (req, res) => {
    try {
        let createOrder = await saveOrder(req);
        if (!createOrder.status)
            return res.status(422).json(createOrder);

        return res.json({ message: "Order saved", order: createOrder.order });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Order couldn't be saved!", err: error });
    }
});

async function saveOrder(req) {
    let currencyCode = req.body.currency;
    let cartId = req.body.cartId;
    let currency = await Currencies.findOne({
        where: {
            code: currencyCode
        }
    });

    let customerCart = await Carts.findByPk(cartId, {
        include: [
            {
                model: Products,
                as: "products"
            },
            {
                model: Coupons,
                as: "coupon"
            },
            {
                model: Addresses,
                as: "address",
                include: ["country", "zone"]
            }
        ],
    });

    if (!customerCart) {
        return { status: false, message: "Invalid cart!" };
    }

    let shippingAddress = customerCart.address;

    let orderData = {
        userId: req.userId,
        referenceNo: (new Date()).getFullYear() + "/" + cartId,
        shipBy: customerCart.eta || "",
        currencyCode: currency.code,
        currencyValue: currency.value,
        orderValue: customerCart.cartValue,
        discount: customerCart.discount || 0,
        couponDiscount: customerCart.couponDiscount || 0,
        shippingCharges: customerCart.shippingCost || 0,
        shippingMethod: customerCart.shippingMethod,
        total: customerCart.total,
        paymentMethod: req.body.paymentMethod,
        status: 0, // In process
        orderProducts: customerCart.products.map((cp) => {
            return {
                productId: cp.id,
                title: cp.name,
                sku: cp.sku,
                ragularPrice: cp.ragularPrice,
                salePrice: cp.salePrice,
                quantity: cp.cartProducts.quantity,
                discount: cp.cartProducts.discount || 0
            }
        }),
        shippingAddress: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            country: shippingAddress.country.name,
            zone: shippingAddress.zone ? shippingAddress.zone.name : null,
            postcode: shippingAddress.postcode,
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            type: shippingAddress.type
        }
    };

    if (customerCart.coupon) {
        orderData.orderCoupons = [{
            couponId: customerCart.coupon.id,
            couponCode: customerCart.coupon.code,
            type: customerCart.coupon.discountType,
            couponValue: customerCart.coupon.amount
        }];
    }

    let order = await Orders.create(orderData, {
        include: [{
            model: OrdersProducts,
            as: "orderProducts"
        }, {
            model: OrderAddresses,
            as: "shippingAddress"
        }, {
            model: OrdersCoupons,
            as: "orderCoupons"
        }],
    });

    return { status: true, order: order };
}

module.exports = route;