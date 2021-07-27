const { default: axios } = require("axios");
const { Orders, Carts, Products, Currencies, Countries, Shipments, Manifests } = require("../../models");
const { ship_from } = require("../packing_boxes");

const route = require("express").Router();

route.get("/", async (req, res) => {
    let params = {
        order: [
            ['id', 'desc']
        ],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    try {
        let shipments = await Shipments.findAndCountAll(params);
        return res.json(shipments);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

route.get("/manifests", async (req, res) => {
    let params = {
        order: [
            ['id', 'desc']
        ],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    try {
        let mani = await Manifests.findAndCountAll(params);
        return res.json(mani);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

route.post("/dhl/create", async (req, res) => {
    try {
        let orderId = req.body.orderId;
        let order = await Orders.findByPk(orderId, { include: ["shippingAddress", "user"], rejectOnEmpty: true });
        let cartId = order.referenceNo.split("/")[1];
        let cart = await Carts.findByPk(cartId, {
            rejectOnEmpty: true,
            paranoid: false,
            include: [{
                model: Products,
                as: "products",
                through: { paranoid: false }
            }],
        });

        let defaultCurrency = await Currencies.findOne({
            where: {
                value: 1
            }
        });

        let country = await Countries.findOne({
            where: {
                name: order.shippingAddress.country
            },
            rejectOnEmpty: true
        });


        let parcelData = await cart.getShipingParcels(defaultCurrency);

        let requestBody = {
            async: false,
            customs: {
                billing: {
                    paid_by: "shipper"
                },
                terms_of_trade: "dap",
                purpose: "merchandise"
            },
            service_type: cart.shippingMethod.replace(/ /g, "_").toLowerCase(),
            shipper_account: {
                id: process.env.DHL_KEY
            },
            references: [
                order.referenceNo
            ],
            shipment: {
                ship_to: {
                    contact_name: order.shippingAddress.name,
                    phone: order.shippingAddress.phone,
                    email: order.user.email,
                    street1: order.shippingAddress.address,
                    city: order.shippingAddress.city,
                    postal_code: order.shippingAddress.postcode,
                    state: order.shippingAddress.zone,
                    country: country.code_3,
                    type: order.shippingAddress.type === 'office' ? 'business' : 'residential',
                },
                ship_from: ship_from,
                parcels: parcelData
            }
        }

        let requestData = await axios.post(process.env.POSTMEN_URL + "/labels", requestBody, {
            headers: {
                'content-type': 'application/json',
                'postmen-api-key': process.env.POSTMEN_KEY
            }
        });

        let responseData = requestData.data;

        if (responseData.meta.code === 200) {
            let shipmentObj = {
                orderId: orderId,
                shipmentId: responseData.data.id,
                status: responseData.data.status,
                shipDate: responseData.data.ship_date,
                trackingNumber: responseData.data.tracking_numbers[0],
                label: responseData.data.files.label.url,
                invoice: responseData.data.files.invoice.url,
                manifest: responseData.data.files.manifest,
                chargeWeightValue: responseData.data.rate.charge_weight.value,
                chargeWeightUnit: responseData.data.rate.charge_weight.unit,
                totalChargeAmount: responseData.data.rate.total_charge.amount,
                totalChargeCurrency: responseData.data.rate.total_charge.currency,
                serviceName: responseData.data.rate.service_name,
                pickupDeadline: responseData.data.rate.pickup_deadline,
                bookingCutOff: responseData.data.rate.booking_cut_off,
                deliveryDate: responseData.data.rate.delivery_date,
                transitTime: responseData.data.rate.transit_time,
                detailedCharges: responseData.data.rate.detailed_charges,
                errorMessage: responseData.data.rate.error_message,
            }

            console.log(shipmentObj)
            await Shipments.create(shipmentObj);
        }


        return res.status(201).json({ message: "Shipment Created!" });

    } catch (err) {
        console.log(err);
        return res.status(422).json({ message: err.message || "No Message Available" });
    }
});

route.post("/dhl/cancel", async (req, res) => {
    try {
        let shipmentId = req.body.shipmentId;
        let shipment = await Shipments.findByPk(shipmentId);
        await axios.post(process.env.POSTMEN_URL + "/cancel-labels", {
            async: false,
            label: {
                id: shipment.shipmentId
            }
        }, {
            headers: {
                'content-type': 'application/json',
                'postmen-api-key': process.env.POSTMEN_KEY
            }
        });
        shipment.status = "cancelled";
        await shipment.save();
        await shipment.destroy();
        return res.status(201).json({ message: "Shipment Cancelled!" });
    } catch (err) {
        console.log(err);
        return res.status(422).json({ message: err.message || "No Message Available" });

    }
});

route.get("/dhl/manifest/create", async (req, res) => {
    try {
        let manifest = await axios.post(process.env.POSTMEN_URL + "/manifests", {
            async: false,
            shipper_account: {
                id: process.env.DHL_KEY
            }
        }, {
            headers: {
                'content-type': 'application/json',
                'postmen-api-key': process.env.POSTMEN_KEY
            }
        });

        let responseData = manifest.data;

        if (responseData.meta.code === 200) {
            let manifestObj = {
                manifestId: responseData.data.id,
                manifest: responseData.data.files.manifest.url,
                status: responseData.data.status
            };

            let shipmentIds = responseData.data.labels.map((s) => {
                if (s.manifested) return s.id;
            });

            let manifest = await Manifests.create(manifestObj);
            await Shipments.update({ manifestId: manifest.id, status: "manifested" }, { where: { shipmentId: shipmentIds } });
        } else {
            console.log(responseData);
            throw new Error("Manifest Not Created!")
        }

        return res.status(201).json({ message: "Manifest Created!" });
    } catch (err) {
        console.log(err);
        return res.status(422).json({ message: err.message || "No Message Available" });
    }
});

route.patch("/dhl/manifest", async (req, res) => {
    try {
        let manifestId = req.body.id;
        let status = req.body.status;
        await Manifests.update({ status: status }, { where: { id: manifestId } });
        await Shipments.update({ status: status }, { where: { manifestId: manifestId } });
        return res.status(201).json({ message: "Manifest Closed!" });
    } catch (err) {
        console.log(err);
        return res.status(422).json({ message: err.message || "No Message Available" });
    }
});

module.exports = route;