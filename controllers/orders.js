const route = require("express").Router();
const seqConnection = require("../models/connection");
const { Currencies, Addresses, Carts, Orders, OrderAddresses,
    OrdersProducts, OrdersCoupons, Products, Users, Uploads, Payments, OrdersHistories } = require("../models/index");
const OrdersAddresses = require("../models/orders_addresses");
const { sendOrderEmail } = require("../controllers/emails/mailer");

route.patch("/updateStatus", async (req, res) => {
    try {
        let order = await Orders.findByPk(req.body.orderId, {
            raw: true,
            nest: true,
            include: [
                {
                    model: Users,
                    as: "user"
                },
                {
                    model: Products,
                    as: "products",
                    include: [{
                        model: Uploads,
                        as: "featuredImage"
                    }]
                }
            ]
        });

        if (order.status === req.body.status) throw new Error("Status couldn't be updated");
        await Orders.update({ status: req.body.status }, { where: { id: req.body.orderId } });
        //sendOrderEmail(order);
        return res.json(order);
    } catch (e) {
        return res.status(400).json(e);
    }
});


route.post("/payment", (req, res) => {
    Payments.create(req.body)
        .then((data) => {
            return res.status(200).json();
        }).catch((err) => {
            console.log(err);
            return res.status(400).json(err);
        });
});


route.patch("/:orderId", async (req, res) => {
    let reqBody = req.body;
    try {
        if (reqBody.action === "order") {
            await Orders.update(reqBody, {
                where: {
                    id: req.params.orderId,
                    userId: req.userId
                }
            });

            return res.json({ message: "Successfully updated!" })
        } else if (reqBody.action === "updateAllOrderData") {
            let updateOrder = await saveOrder(req, req.params.orderId);
            if (!updateOrder.status)
                return res.status(422).json(updateOrder);

            return res.json({ message: "Successfully updated!", order: updateOrder.order });
        }
    } catch (err) {
        console.log(err)
        return res.status(422).json(err);
    }
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

        return res.json({ message: "Order saved", order: createOrder.order });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Order couldn't be saved!", err: error });
    }
});

async function saveOrder(req, orderId = null) {
    let order = req.body;
    let currency = await Currencies.findOne({
        where: {
            code: order.currencyCode
        },
        raw: true
    });

    if (!currency) {
        return { message: "Invalid currency code", status: false }
    }

    if (order.currencyValue !== currency.value) {
        return { message: "Currency value didn't match", status: false }
    }

    let shippingAddress = await Addresses.findOne({
        where: {
            id: order.shippingAddressId
        },
        include: ["country", "zone"],
        raw: true,
        nest: true
    })

    if (!shippingAddress) {
        return { message: "Invalid shipping address", status: false }
    }

    let customerCart = await Carts.findAll({
        where: {
            userId: req.userId
        },
        include: [{
            model: Products,
            as: "products"
        }],
        raw: true,
        nest: true
    })

    let orderValue = 0, shippingCharges = order.shippingCharges, discount = 0, totalOrderValue = 0;
    let anyOutOfStock = 0;
    for (let cartProduct of customerCart) {
        orderValue += cartProduct.products.cartProducts.quantity * cartProduct.products.ragularPrice;
        if (cartProduct.products.salePrice === 0) {
            totalOrderValue += cartProduct.products.cartProducts.quantity * cartProduct.products.ragularPrice;
        } else {
            totalOrderValue += cartProduct.products.cartProducts.quantity * cartProduct.products.salePrice;
            discount += (cartProduct.products.cartProducts.quantity * cartProduct.products.ragularPrice) - (cartProduct.products.cartProducts.quantity * cartProduct.products.salePrice);
        }

        if (!Products.getCurrentStockStatus(cartProduct.products)) {
            anyOutOfStock = 1;
            break;
        }
    }

    if (anyOutOfStock) {
        return { message: "Product sold out! Check your cart", status: false };
    }

    totalOrderValue = totalOrderValue + shippingCharges;
    totalOrderValue = parseFloat(totalOrderValue.toFixed(2));

    if (totalOrderValue !== order.amount) {
        return { message: "Order value not matched!", status: false }
    }

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

        let newOrder = null;

        // If updating order
        if (orderId) {
            let savedOrder = await Orders.findByPk(orderId, { transaction: t });
            await OrdersAddresses.destroy({ where: { id: savedOrder.shippingAddressId } });
            await OrdersProducts.destroy({ where: { orderId: orderId } })
            await OrdersCoupons.destroy({ where: { orderId: orderId } });

            await Orders.update({
                userId: req.userId,
                shippingAddressId: orderAddress.id,
                currencyCode: currency.code,
                currencyValue: currency.value,
                orderValue: orderValue,
                discount: discount,
                shippingCharges: shippingCharges,
                shippingMethod: order.shipingService,
                total: totalOrderValue,
                status: 0 // Create
            }, {
                where: {
                    id: orderId
                }, transaction: t
            });

            newOrder = await Orders.findByPk(orderId, { transaction: t });
        } else {
            newOrder = await Orders.create({
                userId: req.userId,
                shippingAddressId: orderAddress.id,
                currencyCode: currency.code,
                currencyValue: currency.value,
                orderValue: orderValue,
                discount: discount,
                shippingCharges: shippingCharges,
                shippingMethod: order.shipingService,
                total: totalOrderValue,
                status: 0 // Create
            }, { transaction: t });
        }

        for (let cartProduct of customerCart) {
            await newOrder.addProducts(cartProduct.products.id, {
                through: {
                    title: cartProduct.products.name,
                    sku: cartProduct.products.sku,
                    ragularPrice: cartProduct.products.ragularPrice,
                    salePrice: cartProduct.products.salePrice,
                    quantity: cartProduct.products.cartProducts.quantity,
                    discount: 0
                },
                transaction: t
            });
        }
        return newOrder;
    });

    return { status: true, order: createOrder };
}

module.exports = route;