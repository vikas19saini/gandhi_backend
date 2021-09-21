const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middleware/auth');
const { Carts, Currencies } = require('../models');

const route = require('express').Router();

route.get("/config", [isAuthenticated], async (req, res) => {
    let payments = [{
        name: "paypal",
        mode: process.env.PAYPAL_MODE,
        key: process.env.PAYPAL_KEY,
        title: "Paypal Express Checkout",
        currencies: ["usd", "thb", "myr"],
        description: "Click here to choose this payment method and Please wait until you see payment options."
    }, {
        name: "2c2p",
        url: process.env.BANK_PAYMENT_URL,
        merchantId: process.env.BANK_PAYMENT_ID,
        title: "credit/debit card",
        currencies: ["usd", "thb", "myr"],
        description: "You will be redirected to the external website where you can complete payment."
    }];

    return res.json(payments);
});


route.post("/capture", async (req, res) => {
    console.log(req.body);
});

route.post("/paymentToken", [isAuthenticated], async (req, res) => {

    let { cartId, currencyId } = req.body;

    try {
        let cart = await Carts.findByPk(cartId, { rejectOnEmpty: true });
        let currency = await Currencies.findByPk(currencyId, { rejectOnEmpty: true });

        let totalAmount = Number((cart.total * currency.value).toFixed(2));
        let payload = {
            merchantID: process.env.MER_ID,
            invoiceNo: `GFORDCART${cart.id}`,
            amount: totalAmount,
            description: `Payment against cart ID # ${cartId}`,
            currencyCode: currency.code,
            tokenize: true,
            invoicePrefix: "GFORD",
            userDefined1: cartId,
            frontendReturnUrl: `${process.env.APP_URL}/order/${cartId}`,
            backendReturnUrl: `${process.env.WEB_URL}/payments/capture`,
            recurring: false,
            immediatePayment: true
        }

        let token = jwt.sign(payload, process.env.SHAKEY, { algorithm: "HS256" });
        let response = await axios.post(`${process.env.CPEND_POINT}/paymentToken`, {
            payload: token
        }, {
            headers: {
                contentType: "application/json"
            }
        });

        let decodedResponse = jwt.decode(response.data.payload, payload, { algorithm: "HS256" });
        if (decodedResponse.respCode !== "0000") {
            return res.status(400).json({ status: "Fail" });
        }

        return res.status(200).json(decodedResponse);

    } catch (err) {
        console.log(err)
        return res.status(400).json(err);
    }

})

module.exports = route;