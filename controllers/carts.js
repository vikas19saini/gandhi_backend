const route = require("express").Router();
const { Carts, Addresses, Products, Currencies, Coupons, Categories, Users, Orders, Uploads } = require("../models/index");
const axios = require("axios");
const seqConnection = require("../models/connection");
const CartProducts = require("../models/cart_products");
const { isAuthenticated, validateIsLoggedIn } = require("../middleware/auth");
const { Op } = require("sequelize");
var dateFormat = require("dateformat");
const { ship_from } = require("./packing_boxes");

route.get("/:cartId", async (req, res) => {
    Carts.findByPk(req.params.cartId, {
        include: [
            {
                model: Products,
                as: "products",
                through: { attributes: { exclude: ["createdAt", "deletedAt", "updatedAt"] } },
                attributes: ["id", [`${req.headers.lang ? req.headers.lang + "_" : ""}name`, "name"], "sku", "slug", "ragularPrice", "salePrice", "quantity", "manageStock", "minOrderQuantity", "step", "status", "currentStockStatus"],
                include: [{
                    model: Uploads,
                    as: "featuredImage",
                    attributes: {
                        exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
                    },
                }]
            },
            {
                model: Coupons,
                as: "coupon"
            },
            {
                model: Addresses,
                as: "address"
            }
        ],
        rejectOnEmpty: true
    }).then((d) => {
        return res.json(d);
    }).catch(e => {
        return res.status(404).json(e);
    })
});

// Creating new cart and add items
route.post("/", [validateIsLoggedIn], async (req, res) => {
    try {
        let cartTransaction = await seqConnection.transaction(async (t) => {
            let cart = await Carts.create({ userId: req.userId || null, status: 0 }, { transaction: t });
            await cart.addProducts([req.body.productId], { through: { quantity: req.body.quantity }, transaction: t })
            return cart;
        });

        return res.json(cartTransaction);

    } catch (err) {
        return res.status(400).json(err)
    }
});

route.post("/allocateStock", [validateIsLoggedIn], async (req, res) => {
    try {

        if (!req.body.cartId) throw new Error("Cart ID is mandatory!");

        let cart = await Carts.findByPk(req.body.cartId, {
            include: ["products"]
        });

        for (let cp of cart.products) {
            if (cp.cartProducts.status !== 1) {
                let status = await cp.allocateStock(cp.cartProducts.quantity);
                await CartProducts.update({ status: status }, { where: { id: cp.cartProducts.id } });
            }
        }

        return res.json({ message: "Stock allocated" });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

route.post("/applyCoupon", [/* isAuthenticated */], async (req, res) => {
    try {
        let coupon = await Coupons.findOne({
            where: {
                [Op.and]: [
                    { code: req.body.couponCode },
                    { status: 1 },
                    {
                        endDate: {
                            [Op.gte]: dateFormat(new Date(), "yyyy-mm-dd")
                        }
                    }
                ]
            },
            include: [
                {
                    model: Categories,
                    as: "categories",
                    attributes: ["id"]
                },
                {
                    model: Users,
                    as: "users",
                    attributes: ["id"]
                }
            ]
        });

        if (!coupon)
            return res.status(400).json({ message: "Invalid coupon code" });

        if (coupon.users.length > 0 && req.userId) {
            let haveUser = coupon.users.filter(cu => cu.id === req.userId);
            if (haveUser.length === 0)
                return res.status(400).json({ message: "Invalid coupon code" });
        }

        let cart = await Carts.findByPk(req.body.cartId);
        if ((cart.minSpend) && ((cart.total - cart.shippingCost) < cart.minSpend)) {
            return res.status(400).json({ message: "Cart value is less than min spend!" });
        }

        if ((cart.maxSpend) && ((cart.total - cart.shippingCost) > cart.minSpend)) {
            return res.status(400).json({ message: "Cart value is grater than max spend!" });
        }

        if (coupon.limitPerUser && req.userId) {
            let orders = await Orders.findAll({
                where: {
                    userId: req.userId,
                    '$coupons.code$': req.body.couponCode
                },
                include: [
                    {
                        model: Coupons,
                        as: "coupons",
                        required: true
                    }
                ]
            });

            if (orders && orders.length >= coupon.usageLimit) {
                return res.status(400).json({ message: "Avail limit exceed!" });
            }
        }

        if (coupon.usageLimit) {
            let orders = await Orders.findAll({
                include: [
                    {
                        model: Coupons,
                        as: "coupons",
                        where: {
                            code: req.body.couponCode
                        }
                    }
                ]
            });

            if (orders && orders.length >= coupon.usageLimit) {
                return res.status(400).json({ message: "Invalid coupon code!" });
            }
        }

        await Carts.update({ couponId: coupon.id }, { where: { id: req.body.cartId } });

        return res.json({ message: "Coupon successfully applied" });
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

// Updating cart items
route.patch("/", [validateIsLoggedIn], async (req, res) => {
    try {

        if (!req.body.cartId || !req.body.productId || !req.body.quantity) throw new Error("Cart id, product id & quantity is mandatory");

        let cart = await Carts.findByPk(req.body.cartId);
        cart.userId = req.userId || null;
        await cart.save();

        if (req.body.cartProductId) {
            let cartProduct = await CartProducts.findByPk(req.body.cartProductId, { include: ["product"] });
            cartProduct.quantity = req.body.quantity;
            cartProduct.status = 0;
            await cartProduct.save();
        } else {
            await CartProducts.create({
                cartId: req.body.cartId,
                productId: req.body.productId,
                quantity: req.body.quantity
            });
        }

        return res.json({ message: "Cart updated" });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
});

route.post("/remove", async (req, res) => {
    try {
        let cartProduct = await CartProducts.findByPk(req.body.cartProductId, { include: ["product"] });
        await cartProduct.destroy();
        return res.json({ message: "Removed from cart!" });
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.post("/calculateShipping", [isAuthenticated], async (req, res) => {
    try {

        if (!req.body.addressId || !req.body.cartId) throw new Error("Address id and cart id is mandatory!");

        let cart = await Carts.findByPk(req.body.cartId, { include: [{ model: Coupons, as: "coupon" }, { model: Products, as: "products" }], rejectOnEmpty: true });

        if (req.body.storePickup) {
            await Carts.update({ addressId: req.body.addressId, shippingCost: 0, eta: "", shippingMethod: "Store_Pickup" }, { where: { id: req.body.cartId } });
            return res.json({ message: "Cart updated" });
        }

        let shippingMethods = await __calulateShipping(req.body.addressId, cart);
        if (shippingMethods) {
            shippingMethods.sort((a, b) => (a.cost > b.cost) ? 1 : ((b.cost > a.cost) ? -1 : 0))
            shippingMethod = shippingMethods[0].serviceName;
            eta = shippingMethods[0].eta;
            shippingCost = shippingMethods[0].cost;
            await Carts.update({ addressId: req.body.addressId, shippingCost: shippingCost, eta: eta, shippingMethod: shippingMethod }, { where: { id: req.body.cartId } });
        } else {
            throw new Error("Shipping is not available at this location!");
        }

        return res.json({ message: "Cart updated" });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

route.post("/removeCoupon", [/* isAuthenticated */], async (req, res) => {
    Carts.update({ couponId: null }, { where: { id: req.body.cartId } }).then(async (r) => {
        return res.json({ message: "Coupon removed" });
    }).catch((err) => {
        return res.status(400).json(err);
    });
});

route.post("/calculateCart", async (req, res) => {
    try {
        if (!req.body.cartId) throw new Error("Please provide cart id");

        let cart = await Carts.findByPk(req.body.cartId, {
            include: [{ model: Coupons, as: "coupon" }, { model: Products, as: "products" }], rejectOnEmpty: true
        });

        await cart.calculateCart();
        return res.json({ message: "Cart calculated" });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });
    }
})

async function __calulateShipping(addressId, cart) {

    let address = await Addresses.findOne({
        where: {
            id: parseInt(addressId)
        },
        include: ["country", "zone", "user"],
        raw: true,
        nest: true,
        rejectOnEmpty: true
    });

    if ("tha" === address.country.code_3.toLowerCase()) {
        Date.prototype.addDays = function (days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }

        let date = new Date();
        let delDate = date.addDays(7);
        return [{
            serviceName: "Thailandpost",
            cost: 100,
            eta: dateFormat(delDate, 'yyyy-mm-dd HH:MM:ss')
        }];
    }

    let requestBody = {
        async: false,
        shipper_accounts: [
            {
                id: process.env.DHL_KEY
            }
        ],
        is_document: false,
        shipment: {
            ship_to: {
                contact_name: address.name,
                phone: address.phone,
                email: address.user.email,
                street1: address.address,
                city: address.city,
                postal_code: address.postcode,
                state: address.zone.code,
                country: address.country.code_3,
                type: address.type === 'office' ? 'business' : 'residential',
            },
            ship_from: ship_from
        }
    };

    let defaultCurrency = await Currencies.findOne({
        where: {
            value: 1
        }
    });

    let parcelData = await cart.getShipingParcels(defaultCurrency);
    requestBody.shipment.parcels = parcelData;

    let rates = [];

    let requestData = await axios.post(process.env.POSTMEN_URL + "/rates", requestBody, {
        headers: {
            'content-type': 'application/json',
            'postmen-api-key': process.env.POSTMEN_KEY
        }
    });

    let body = requestData.data;

    if (body.meta.code === 200) {
        let availableRates = body.data.rates || [];
        for (let rate of availableRates) {
            rates.push({
                serviceName: rate.service_name,
                cost: rate.total_charge.amount,
                currency: rate.total_charge.currency,
                eta: rate.delivery_date
            });
        }
    }

    if (rates.length > 0) {
        let currency = await Currencies.findOne({
            where: {
                code: rates[0].currency
            },
            raw: true
        })

        if (!currency) {
            return false;
        }

        let finalRates = [];
        for (let rate of rates) {
            finalRates.push({ ...rate, ...{ cost: rate.cost * currency.value } })
        }

        return finalRates;
    }

    return false;
}

module.exports = route;