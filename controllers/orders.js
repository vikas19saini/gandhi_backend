const route = require("express").Router();
const seqConnection = require("../models/connection");
const { Currencies, Addresses, Carts, Orders, OrderAddresses } = require("../models/index");

route.post("/", async (req, res) => {
    try {
        let order = req.body;
        let currency = await Currencies.findOne({
            where: {
                code: order.currencyCode
            },
            raw: true
        });

        if (!currency) {
            return res.status(422).json({ message: "Invalid currency code" });
        }

        if (order.currencyValue !== currency.value) {
            return res.status(422).json({ message: "Currency value didn't match" })
        }

        let shippingAddress = await Addresses.findOne({
            where: {
                id: order.shippingAddressId
            },
            raw: true
        })

        if (!shippingAddress) {
            return res.status(422).json({ message: "Invalid shipping address" })
        }

        let customerCart = await Carts.findAll({
            where: {
                userId: req.userId
            },
            include: ["product"],
            raw: true,
            nest: true
        })

        let orderValue = 0, shippingCharges = order.shippingCharges, discount = 0, totalOrderValue = 0;

        for (let cartProduct of customerCart) {
            orderValue += cartProduct.quantity * cartProduct.product.ragularPrice;
            if (cartProduct.product.salePrice === 0) {
                totalOrderValue += cartProduct.quantity * cartProduct.product.ragularPrice;
            } else {
                totalOrderValue += cartProduct.quantity * cartProduct.product.salePrice;
                discount += (cartProduct.quantity * cartProduct.product.ragularPrice) - (cartProduct.quantity * cartProduct.product.salePrice);
            }
        }

        totalOrderValue = totalOrderValue + shippingCharges;
        totalOrderValue = parseFloat(totalOrderValue.toFixed(2));
        //let orderProducts

        if (totalOrderValue !== order.amount) {
            return res.status(422).json({ message: "Order value not matched!" });
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

            let order = await Orders.create({
                userId: req.userId,
                shippingAddressId: orderAddress.id,
                currencyCode: currency.code,
                currencyValue: currency.value,
                orderValue: orderValue,
                discount: discount,
                shippingCharges: shippingCharges,
                shippingMethod: order.shipingService,
                total: totalOrderValue,
                status: 0
            }, { transaction: t });
        }, { transaction: t });

        return res.json({ message: "Order saved", order: createOrder });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Order couldn't be saved!", err: error });
    }

})

module.exports = route;