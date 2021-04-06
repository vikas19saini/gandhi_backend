const route = require("express").Router();
const seqConnection = require("../models/connection");
const { Currencies, Addresses, Carts, Orders, OrderAddresses,
    OrdersProducts, OrdersCoupons, Products, Users, Uploads, Payments, OrdersHistories, Coupons } = require("../models/index");
const OrdersAddresses = require("../models/orders_addresses");
const { sendOrderEmail } = require("../controllers/emails/mailer");
const CartProducts = require("../models/cart_products");

route.get("/", async (req, res) => {
    Orders.findAll({
        where: { userId: req.userId },
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
                model: Coupons,
                as: "coupons"
            },
            {
                model: OrdersHistories,
                as: "ordersHistories"
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

route.post("/payment", (req, res) => {
    Payments.create(req.body)
        .then((data) => {
            return res.status(200).json({ message: "Payment details saved" });
        }).catch((err) => {
            console.log(err);
            return res.status(400).json(err);
        });
});

route.get("/:orderId", async (req, res) => {
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
                as: "ordersHistories"
            }
        ]
    }).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json(err);
    })
});

route.post("/", async (req, res) => {
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
    let order = req.body.order;
    let cartId = req.body.cartId;
    let currency = await Currencies.findOne({
        where: {
            code: order.currencyCode
        },
        raw: true
    });

    let shippingAddress = await Addresses.findOne({
        where: {
            id: order.shippingAddressId
        },
        include: ["country", "zone"],
        raw: true,
        nest: true
    })

    let customerCart = await Carts.findByPk(cartId, {
        include: ["products"],
    })

    let orderValue = 0, shippingCharges = order.shippingCharges, discount = 0, totalOrderValue = 0;
    for (let cp of customerCart.products) {
        orderValue += cp.cartProducts.quantity * cp.ragularPrice;
        if (cp.salePrice === 0) {
            totalOrderValue += cp.cartProducts.quantity * cp.ragularPrice;
        } else {
            totalOrderValue += cp.cartProducts.quantity * cp.salePrice;
            discount += (cp.cartProducts.quantity * cp.ragularPrice) - (cp.cartProducts.quantity * cp.salePrice);
        }
    }

    totalOrderValue = totalOrderValue + shippingCharges;
    totalOrderValue = parseFloat(totalOrderValue.toFixed(2));

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
            orderValue: orderValue,
            discount: discount,
            shippingCharges: shippingCharges,
            shippingMethod: order.shipingService,
            total: totalOrderValue,
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
                    discount: 0
                },
                transaction: t
            });
        }

        await Carts.destroy({ where: { id: req.body.cartId } }, { transaction: t });
        await CartProducts.destroy({ where: { cartId: req.body.cartId } }, { transaction: t });

        return newOrder;
    });

    return { status: true, order: createOrder };
}

module.exports = route;