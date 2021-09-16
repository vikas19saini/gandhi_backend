const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');

const route = require('express').Router();

route.get("/config", async (req, res) => {
    let payments = [{
        name: "paypal",
        mode: process.env.PAYPAL_MODE,
        key: process.env.PAYPAL_KEY,
        title: "Paypal Express Checkout",
        currencies: ["usd", "thb", "myr"]
    }, /* {
        name: "bank",
        url: process.env.BANK_PAYMENT_URL,
        merchantId: process.env.BANK_PAYMENT_ID,
        title: "Pay by credit/debit card",
        currencyCode: 840,
        currencies: ["usd"]
    }, {
        name: "bank",
        url: process.env.BANK_PAYMENT_URL,
        merchantId: process.env.BANK_PAYMENT_ID_THAI,
        title: "Pay by credit/debit card",
        currencyCode: 764,
        currencies: ["thb"]
    } */];

    return res.json(payments);
});

route.get("/", async (req, res) => {
    res.render("index");
});

route.post("/", async (req, res) => {
    console.log(req.body);
});

route.get("/paymentToken", async (req, res) => {
    let reqBody = {
        "merchantID": process.env.MER_ID,
        "invoiceNo": Math.random() * 100000000,
        "description": "item 1",
        "amount": 1000.00,
        "currencyCode": "THB",
        tokenize: true,
        recurring: false,
        invoicePrefix: "GF",
        frontendReturnUrl: ""
    }


    let token = jwt.sign(reqBody, process.env.SHAKEY, { algorithm: "HS256" });
    let response = await axios.post("https://sandbox-pgw.2c2p.com/payment/4.1/PaymentToken", {
        payload: token
    }, {
        headers: {
            contentType: "application/json"
        }
    });
    console.log(response.data)
    let authToken = jwt.decode(response.data.payload, reqBody, { algorithm: "HS256" });
    return res.json(authToken);

})

module.exports = route;