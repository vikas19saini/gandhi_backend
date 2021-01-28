const route = require("express").Router();
const { Carts, Addresses, Products, Currencies } = require("../models/index");
const axios = require("axios")

route.post("/sync", async (req, res) => {
    try {
        let cartItems = req.body.cartItems.map(ci => {
            return { productId: ci.id, quantity: ci.quantity };
        });
        let cartItemsSaved = await Carts.findAll({
            where: {
                userId: req.userId
            },
            attributes: ["productId", "quantity"],
            raw: true
        });

        if (cartItemsSaved.length === 0) {
            let cartItemToSave = cartItems.map(ci => {
                return { ...ci, ...{ userId: req.userId } };
            })
            await Carts.bulkCreate(cartItemToSave);
        } else {
            for (let cartProduct of cartItems) {
                let cartPro = await Carts.findOne({
                    where: {
                        productId: cartProduct.productId,
                        userId: req.userId
                    }
                })
                if (cartPro) {
                    await Carts.update({ quantity: cartProduct.quantity }, { where: { productId: cartProduct.productId, userId: req.userId } });
                } else {
                    await Carts.create({ productId: cartProduct.productId, quantity: cartProduct.quantity, userId: req.userId });
                }
            }
        }

        let cartDataAfterSync = await Carts.findAll({
            where: { userId: req.userId },
            attributes: ["productId", "quantity"],
            include: [{
                model: Products,
                as: "product",
                attributes: ["id", "slug"]
            }],
            raw: true,
            nest: true
        });

        cartDataAfterSync = cartDataAfterSync.map(cp => {
            return { id: cp.productId, quantity: cp.quantity, slug: cp.product.slug }
        })

        return res.json(cartDataAfterSync);
    } catch (err) {
        return res.status(500).json(err)
    }

});

route.post("/add", async (req, res) => {
    try {
        let itemSaved = await Carts.findOne({
            where: {
                userId: req.userId,
                productId: req.body.productId
            },
            raw: true
        })

        if (itemSaved) {
            await Carts.update({ quantity: req.body.quantity }, { where: { userId: req.userId, productId: req.body.productId } });
        } else {
            await Carts.create({ ...req.body, ...{ userId: req.userId } });
        }

        return res.json({ message: "Added to cart!" });

    } catch (err) {
        return res.status(400).json(err)
    }
});

route.delete("/remove/:productId", async (req, res) => {
    try {
        await Carts.destroy({
            where: {
                userId: req.userId,
                productId: req.params.productId
            }
        });

        return res.json({ message: "Added to cart!" });
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.get("/calculateShipping/:addressId", async (req, res) => {
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
        include: ["product"],
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
        totalWeighht += parseFloat((cp.product.shippingWeight * cp.quantity).toFixed(2));
        products.push({
            description: cp.product.name,
            origin_country: process.env.STORE_COUNTRY,
            quantity: cp.quantity,
            price: {
                amount: cp.product.salePrice ? cp.product.salePrice : cp.product.ragularPrice,
                currency: defaultCurrency.code
            },
            weight: {
                value: parseFloat((cp.product.shippingWeight).toFixed(2)),
                unit: "kg"
            },
            sku: cp.product.sku
        });
    }

    parcel.weight.value = totalWeighht;
    parcel.items = products;

    return parcel;
}

module.exports = route;