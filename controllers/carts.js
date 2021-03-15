const route = require("express").Router();
const { Carts, Addresses, Products, Currencies } = require("../models/index");
const axios = require("axios");
const seqConnection = require("../models/connection");
const CartProducts = require("../models/cart_products");
const { isAuthenticated } = require("../middleware/auth");

route.get("/:cartId", async (req, res) => {
    Carts.findByPk(req.params.cartId, {
        include: [
            {
                model: Products,
                as: "products",
                attributes: ["id", "name", "slug", "ragularPrice", "salePrice", "quantity", "manageStock", "minOrderQuantity", "step", "status", "currentStockStatus"],
                include: ["featuredImage"]
            }
        ]
    }).then((d) => {
        return res.json(d);
    }).catch(e => {
        return res.status(404).json(e);
    })
});

// Creating new cart and add items
route.post("/", async (req, res) => {
    try {
        let cartTransaction = await seqConnection.transaction(async (t) => {
            let cart = await Carts.create({ userId: req.userId || null, status: 0 }, { transaction: t });
            await cart.addProducts([req.body.productId], { through: { quantity: req.body.quantity }, transaction: t })
            return cart;
        })
        return res.json(cartTransaction);

    } catch (err) {
        return res.status(400).json(err)
    }
});

route.post("/sync", [isAuthenticated], async (req, res) => {
    Carts.update({ userId: req.userId }, { where: { id: req.body.cartId } }).then((d) => {
        return res.json({ message: "Sync" })
    }).catch(err => {
        return res.status(400).json(err);
    })
});

// Updating cart items
route.patch("/", async (req, res) => {
    try {
        let cartTransaction = await seqConnection.transaction(async (t) => {
            await Carts.update({ userId: req.userId || null, status: 0 }, { where: { id: req.body.cartId }, transaction: t });
            let cart = await Carts.findByPk(req.body.cartId);
            await cart.addProducts([req.body.productId], { through: { quantity: req.body.quantity }, transaction: t })
            return cart;
        })
        return res.json(cartTransaction);

    } catch (err) {
        return res.status(400).json(err)
    }
});

route.delete("/remove/:cartProductId", async (req, res) => {
    try {
        await CartProducts.destroy({ where: { id: req.params.cartProductId } });
        return res.json({ message: "Added to cart!" });
    } catch (err) {
        return res.status(404).json(err);
    }
});

route.get("/calculateShipping/:addressId", [isAuthenticated], async (req, res) => {
    try {
        let shippingDetails = await __calulateShipping(req.params.addressId, req.userId)
        if (!shippingDetails) {
            return res.status(422).json({ message: "Shipping service not available at this location!" })
        }
        return res.json(shippingDetails);
    } catch (err) {
        return res.status(500).json(err);
    }
});

async function __calulateShipping(addressId, userId) {
    let address = await Addresses.findOne({
        where: {
            userId: userId,
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

    let parcelData = await parcelDetails(userId)
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

async function parcelDetails(userId) {
    let cart = await Carts.findAll({
        where: { userId: userId },
        include: [{
            model: Products,
            as: "products",
        }],
        raw: true,
        nest: true
    });

    let defaultCurrency = await Currencies.findOne({
        where: {
            value: 1
        },
        raw: true
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
    for (let cp of cart) {
        console.log(cp)
        totalWeighht += parseFloat((cp.products.shippingWeight * cp.products.cartProducts.quantity).toFixed(2));
        products.push({
            description: cp.products.name,
            origin_country: process.env.STORE_COUNTRY,
            quantity: cp.products.cartProducts.quantity,
            price: {
                amount: cp.products.salePrice ? cp.products.salePrice : cp.products.ragularPrice,
                currency: defaultCurrency.code
            },
            weight: {
                value: parseFloat((cp.products.shippingWeight).toFixed(2)),
                unit: "kg"
            },
            sku: cp.products.sku
        });
    }

    parcel.weight.value = totalWeighht;
    parcel.items = products;

    return parcel;
}

module.exports = route;