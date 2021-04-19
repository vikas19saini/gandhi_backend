const route = require("express").Router();
const seqConnection = require("../models/connection");
const { Currencies, Addresses, Carts, Orders, OrderAddresses, Products, Payments, OrdersHistories, Coupons } = require("../models/index");
const { sendOrderEmail } = require("../controllers/emails/mailer");
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

// For bankok bank integration
route.post("/paymentSuccess", async (req, res) => {
    console.log(req.body);
    /* try {
        let createOrder = await saveOrder(req);
        if (!createOrder.status)
            return res.status(422).json(createOrder);

        await sendOrderEmail(createOrder.order.id);
        return res.json({ message: "Order saved", order: createOrder.order });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Order couldn't be saved!", err: error });
    } */
});

route.post("/", [isAuthenticated], async (req, res) => {
    try {
        let createOrder = await saveOrder(req);
        if (!createOrder.status)
            return res.status(422).json(createOrder);

        await sendOrderEmail(createOrder.order.id);
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
    })

    let shippingAddress = customerCart.address;

    let createOrder = await seqConnection.transaction(async (t) => {

        let orderAddress = await OrderAddresses.create({
            address: shippingAddress.address,
            city: shippingAddress.city,
            country: shippingAddress.country.name,
            zone: shippingAddress.zone ? shippingAddress.zone.name : null,
            postcode: shippingAddress.postcode,
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            type: shippingAddress.type
        }, { transaction: t });

        let newOrder = await Orders.create({
            userId: req.userId,
            shippingAddressId: orderAddress.id,
            currencyCode: currency.code,
            currencyValue: currency.value,
            orderValue: customerCart.cartValue,
            discount: customerCart.discount || 0,
            couponDiscount: customerCart.couponDiscount || 0,
            shippingCharges: customerCart.shippingCost || 0,
            shippingMethod: customerCart.shippingMethod,
            total: customerCart.total,
            paymentMethod: req.body.paymentMethod,
            status: 1 // In process
        }, { transaction: t });

        for (let cp of customerCart.products) {
            await newOrder.addProducts(cp.id, {
                through: {
                    title: cp.name,
                    sku: cp.sku,
                    ragularPrice: cp.ragularPrice,
                    salePrice: cp.salePrice,
                    quantity: cp.cartProducts.quantity,
                    discount: cp.cartProducts.discount || 0
                },
                transaction: t
            });
        }

        if (customerCart.coupon) {
            await newOrder.addCoupons(customerCart.coupon.id, {
                through: {
                    couponCode: customerCart.coupon.code,
                    type: customerCart.coupon.discountType,
                    couponValue: customerCart.coupon.amount,
                },
                transaction: t
            });
        }

        await Carts.destroy({ where: { id: req.body.cartId } }, { transaction: t });
        await CartProducts.destroy({ where: { cartId: req.body.cartId } }, { transaction: t });

        return newOrder;
    });

    await OrdersHistories.create({
        orderId: createOrder.id,
        status: 1,
        text: "Order received in process"
    });

    return { status: true, order: createOrder };
}

module.exports = route;