const route = require("express").Router();
const { Carts, Addresses, Products, Currencies, Coupons, Categories, Users, Orders } = require("../models/index");
const axios = require("axios");
const seqConnection = require("../models/connection");
const CartProducts = require("../models/cart_products");
const { isAuthenticated, validateIsLoggedIn } = require("../middleware/auth");
const { Op } = require("sequelize");
const { stockIncDec } = require("./components/product");
var dateFormat = require("dateformat");

route.get("/:cartId", async (req, res) => {
    Carts.findByPk(req.params.cartId, {
        include: [
            {
                model: Products,
                as: "products",
                attributes: ["id", "name", "slug", "ragularPrice", "salePrice", "quantity", "manageStock", "minOrderQuantity", "step", "status", "currentStockStatus"],
                include: ["featuredImage"]
            },
            {
                model: Coupons,
                as: "coupon"
            },
            {
                model: Addresses,
                as: "address"
            }
        ]
    }).then((d) => {
        return res.json(d);
    }).catch(e => {
        return res.status(404).json(e);
    })
});

// Creating new cart and add items
route.post("/", [validateIsLoggedIn, releaseQuantity], async (req, res) => {
    try {
        let cartTransaction = await seqConnection.transaction(async (t) => {
            let cart = await Carts.create({ userId: req.userId || null, status: 0 }, { transaction: t });
            await cart.addProducts([req.body.productId], { through: { quantity: req.body.quantity }, transaction: t })
            return cart;
        });

        await calculateCart(cartTransaction.id);
        return res.json(cartTransaction);

    } catch (err) {
        return res.status(400).json(err)
    }
});

route.post("/allocateStock", [validateIsLoggedIn, releaseQuantity], async (req, res) => {
    if (!req.body.cartId) {
        return res.status(400).json({ message: "Cart ID is mandatory!" });
    }

    try {

        let cart = await Carts.findByPk(req.body.cartId, {
            include: ["products"]
        })

        if (cart.status)
            return res.json({ message: "Stock already allocated!" })

        let status = 1;

        // Validating cart items
        for (let cp of cart.products) {
            if (cp.currentStockStatus && cp.manageStock) {
                if ((cp.quantity < cp.cartProducts.quantity)) {
                    status = 0;
                    break;
                }
            }
        }

        if (!status)
            return res.status(400).json({ message: "Product out of stock!" });


        // Allocating stock
        for (let cp of cart.products) {
            await stockIncDec(cp, 'minus', cp.cartProducts.quantity);
        }

        await Carts.update({ status: 1 }, { where: { id: req.body.cartId } });
        return res.json({ message: "Stock allocated" });

    } catch (err) {
        return res.status(500).json(err);
    }
});

route.post("/applyCoupon", [isAuthenticated], async (req, res) => {
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

        if (coupon.users.length > 0) {
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

        if (coupon.limitPerUser) {
            let orders = await Orders.findAll({
                where: {
                    userId: req.userId,
                    '$Coupons.code$': req.body.couponCode
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
        await calculateCart(req.body.cartId);
        return res.json(coupon);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
})

route.post("/sync", [isAuthenticated, releaseQuantity], async (req, res) => {

    try {

        if (!req.body.cartId) {
            Carts.findOne({
                where: {
                    userId: req.userId
                },
                include: [
                    {
                        model: Products,
                        as: "products",
                        attributes: ["id"]
                    }
                ]
            }).then(async (cart) => {
                await calculateCart(cart.id);
                return res.json(cart);
            })
        } else {
            let carts = await Carts.findAll({
                where: {
                    [Op.or]: [
                        { userId: req.userId },
                        { id: req.body.cartId }
                    ]
                },
                include: [
                    {
                        model: Products,
                        as: "products",
                        attributes: ["id"]
                    }
                ]
            });

            let userCartProducts = [];
            let cartIds = [];
            for (let cart of carts) {
                cartIds.push(cart.id);
                for (let p of cart.products) {
                    userCartProducts.push({
                        productId: p.cartProducts.productId,
                        quantity: p.cartProducts.quantity
                    });
                }
            }

            await CartProducts.destroy({
                where: {
                    cartId: cartIds
                }
            });

            await Carts.update({
                userId: req.userId
            }, {
                where: {
                    id: req.body.cartId
                }
            })

            let userCurrentCart = await Carts.findByPk(req.body.cartId);
            for (let cp of userCartProducts) {
                await userCurrentCart.addProducts([cp.productId], { through: { quantity: cp.quantity } });
            }

            await Carts.destroy({
                where: {
                    userId: req.userId,
                    id: {
                        [Op.ne]: req.body.cartId
                    }
                }
            });

            Carts.findByPk(req.body.cartId, {
                include: [
                    {
                        model: Products,
                        as: "products",
                        attributes: ["id"]
                    }
                ]
            }).then(async (cart) => {
                await calculateCart(cart.id);
                return res.json(cart);
            });
        }

    } catch (err) {
        return res.status(400).json(err);
    }

});

// Updating cart items
route.patch("/", [validateIsLoggedIn, releaseQuantity], async (req, res) => {
    try {
        let cartTransaction = await seqConnection.transaction(async (t) => {
            await Carts.update({ userId: req.userId || null, status: 0 }, { where: { id: req.body.cartId }, transaction: t });
            let cart = await Carts.findByPk(req.body.cartId);
            await cart.addProducts([req.body.productId], { through: { quantity: req.body.quantity }, transaction: t })
            return cart;
        });

        await calculateCart(cartTransaction.id);
        return res.json(cartTransaction);

    } catch (err) {
        return res.status(400).json(err)
    }
});

route.post("/remove", [releaseQuantity], async (req, res) => {
    try {
        await CartProducts.destroy({ where: { id: req.body.cartProductId } });
        await calculateCart(req.body.cartId);
        return res.json({ message: "Added to cart!" });
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.post("/calculateShipping", [isAuthenticated], async (req, res) => {
    try {
        await Carts.update({ addressId: req.body.addressId }, { where: { id: req.body.cartId } });
        await calculateCart(req.body.cartId);
        return res.json({ message: "Cart updated" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

route.post("/removeCoupon", [isAuthenticated], async (req, res) => {
    Carts.update({ couponId: null }, { where: { id: req.body.cartId } }).then(async (r) => {
        await calculateCart(req.body.cartId);
        return res.json({ message: "Coupon removed" });
    }).catch((err) => {
        return res.status(400).json(err);
    });
});

async function __calulateShipping(addressId, cart) {
    let address = await Addresses.findOne({
        where: {
            id: parseInt(addressId)
        },
        include: ["country", "zone", "user"],
        raw: true,
        nest: true
    });

    if (!address) {
        return false;
    }

    if ("tha" === address.country.code_3.toLowerCase()) {
        return [{
            serviceName: "Thailandpost",
            cost: 0,
            eta: "2021-01-29T10:00:00+00:00"
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
            ship_from: {
                contact_name: "Wisa Singh",
                company_name: "GANDHI IMPEX LTD PART",
                street1: "326 Phahurat Rd, Wang Burapha Phirom",
                country: "TH",
                type: "business",
                postal_code: "10200",
                city: "Bangkok",
                phone: "0888812761",
                street2: "Phra Nakhon",
                tax_id: null,
                street3: "THAILAND",
                state: null,
                email: "gandhi326projects@gmail.com",
                fax: null
            }
        }
    };

    let parcelData = await parcelDetails(cart)
    requestBody.shipment.parcels = [parcelData];

    let rates = [];
    let requestData = await axios.post(process.env.POSTMEN_URL, requestBody, {
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

async function parcelDetails(cart) {

    let defaultCurrency = await Currencies.findOne({
        where: {
            value: 1
        }
    })

    let parcel = {
        description: "Gandhi Box",
        box_type: "custom",
        weight: {
            value: 0,
            unit: "kg"
        },
        dimension: {
            width: 40,
            height: 40,
            depth: 40,
            unit: "cm"
        },
    }

    let products = [], totalWeighht = 0;
    for (let cp of cart.products) {
        totalWeighht += parseFloat((cp.shippingWeight * cp.cartProducts.quantity).toFixed(2));
        products.push({
            description: cp.name,
            origin_country: process.env.STORE_COUNTRY,
            quantity: 1,
            price: {
                amount: cp.salePrice ? cp.salePrice : cp.ragularPrice,
                currency: defaultCurrency.code
            },
            weight: {
                value: parseFloat((cp.shippingWeight).toFixed(2)),
                unit: "kg"
            },
            sku: cp.sku
        });
    }

    parcel.weight.value = totalWeighht;
    parcel.items = products;

    return parcel;
}

async function releaseQuantity(req, res, next) {

    if (req.body.cartId) {
        let cart = await Carts.findByPk(req.body.cartId, {
            include: [{
                model: Coupons,
                as: "coupon"
            }, {
                model: Products,
                as: "products"
            }]
        });

        if (cart.status === 1 && cart.products) {
            for (let cp of cart.products) {
                await stockIncDec(cp, "plus", cp.cartProducts.quantity);
            }
        }

        await Carts.update({ status: 0, couponId: null }, { where: { id: req.body.cartId } });
    }
    next();
}

async function calculateCart(cartId) {
    let cart = await Carts.findByPk(cartId, {
        include: [{
            model: Coupons,
            as: "coupon"
        }, {
            model: Products,
            as: "products"
        }]
    });

    if (!cart)
        return;

    let cartValue = 0, discount = 0, couponDiscount = 0, shippingCost = 0, total = 0, shippingMethod = "", eta = "";
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

    if (cart.addressId) {
        let shippingMethods = await __calulateShipping(cart.addressId, cart);
        if (shippingMethods) {
            shippingMethod = shippingMethods[0].serviceName;
            eta = shippingMethods[0].eta;
            shippingCost = shippingMethods[0].cost;
        } else {
            throw new Error("Shipping is not available at this location!");
        }

        total += shippingCost;
    }

    let status = 0;
    for (let cp of cart.products) {
        if (!cp.currentStockStatus) {
            status = 2;
            break;
        }
    }

    await Carts.update({
        cartValue: cartValue,
        discount: discount,
        couponDiscount: couponDiscount,
        shippingCost: shippingCost,
        total: total,
        shippingMethod: shippingMethod,
        eta: eta,
        status: status
    }, { where: { id: cart.id } });
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

module.exports = route;